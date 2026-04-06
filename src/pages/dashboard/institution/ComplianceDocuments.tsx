import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Trash2, CheckCircle, AlertCircle, Calendar, Search, Eye } from "lucide-react";
import { format, isPast } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
const supabaseAny = supabase as any;
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface Athlete {
  id: string;
  full_name: string;
  sport: string;
}

interface Document {
  id: string;
  athlete_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  expires_at?: string;
  verification_status: string;
  verified_by_name?: string;
  athlete_name?: string;
}

const ComplianceDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Upload form state
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [documentType, setDocumentType] = useState("medical_form");
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    loadInstitutionData();
  }, [user]);

  const loadInstitutionData = async () => {
    setLoading(true);
    
    const { data: instData } = await supabase
      .from("institutions")
      .select("id")
      .eq("profile_id", user!.id)
      .maybeSingle();
    
    if (instData) {
      setInstitution(instData);
      
      // Load athletes
      const { data: athleteData } = await supabase
        .from("athletes")
        .select("*")
        .eq("institution_id", instData.id)
        .order("full_name");
      
      if (athleteData) {
        setAthletes(athleteData as Athlete[]);
      }
      
      // Load documents
      await loadDocuments(instData.id);
    }
    
    setLoading(false);
  };

  const loadDocuments = async (institutionId: string) => {
    // First get all athlete IDs for this institution
    const { data: athleteData } = await supabase
      .from("athletes")
      .select("id")
      .eq("institution_id", institutionId);
    
    if (!athleteData || athleteData.length === 0) {
      setDocuments([]);
      return;
    }
    
    const athleteIds = athleteData.map(a => a.id);
    
    // Then load documents for these athletes
    const { data } = await (supabase as any)
      .from("athlete_documents")
      .select(`
        *,
        athletes(full_name)
      `)
      .in("athlete_id", athleteIds)
      .order("upload_date", { ascending: false });
    
    if (data) {
      setDocuments(data as unknown as Document[]);
    }
  };

  const handleUploadDocument = async () => {
    if (!institution || !selectedAthlete || !file) return;
    
    setSaving(true);
    try {
      // Upload file to storage
      const ext = file.name.split(".").pop();
      const path = `compliance/${selectedAthlete}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("athlete_media")
        .upload(path, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("athlete_media")
        .getPublicUrl(path);
      
      // Create document record
      const { error: insertError } = await supabaseAny.from("athlete_documents").insert({
        athlete_id: selectedAthlete,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size_bytes: file.size,
        mime_type: file.type,
        expires_at: expiryDate ? new Date(expiryDate).toISOString() : null,
        notes: notes || null,
        status: 'pending',
        upload_date: new Date().toISOString(),
      });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Document uploaded!",
        description: `${file.name} has been saved for ${athletes.find(a => a.id === selectedAthlete)?.full_name}`,
      });
      
      // Reset form
      setFile(null);
      setNotes("");
      setExpiryDate("");
      setUploadDialogOpen(false);
      loadDocuments(institution!.id);
      
    } catch (error: any) {
      handleQueryError(error, "Failed to upload document.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    const { error } = await supabaseAny.from("athlete_documents").delete().eq("id", id);
    
    if (error) {
      handleQueryError(error, "Failed to delete document.");
    } else {
      toast({ title: "Document deleted" });
      if (institution) loadDocuments(institution.id);
    }
  };

  const handleVerifyDocument = async (id: string) => {
    const { error } = await (supabase as any)
      .from("athlete_documents")
      .update({
        verification_status: 'verified',
        verified_by: user!.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id);
    
    if (error) {
      handleQueryError(error, "Failed to verify document.");
    } else {
      toast({ title: "Document verified!", description: "Marked as verified." });
      if (institution) loadDocuments(institution.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Pending</Badge>;
      case 'verified': return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'expired': return <Badge variant="secondary" className="bg-red-500/10 text-red-600"><AlertCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringSoon = documents.filter(doc => 
    doc.expires_at && !isPast(new Date(doc.expires_at)) && 
    new Date(doc.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Compliance Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage medical forms, consents, and certificates
            </p>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Compliance Document</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Athlete *</Label>
                  <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select athlete..." />
                    </SelectTrigger>
                    <SelectContent>
                      {athletes.map(athlete => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.full_name} - {athlete.sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical_form">Medical Form</SelectItem>
                      <SelectItem value="parental_consent">Parental Consent</SelectItem>
                      <SelectItem value="insurance">Insurance Certificate</SelectItem>
                      <SelectItem value="transfer_certificate">Transfer Certificate</SelectItem>
                      <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                      <SelectItem value="photo_release">Photo Release</SelectItem>
                      <SelectItem value="code_of_conduct">Code of Conduct</SelectItem>
                      <SelectItem value="emergency_contact">Emergency Contact</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>File *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, images, or Word documents (max 10MB)
                  </p>
                </div>
                
                <div>
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank for non-expiring documents
                  </p>
                </div>
                
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleUploadDocument}
                  disabled={saving || !selectedAthlete || !file}
                >
                  {saving ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expiring Soon Alert */}
        {expiringSoon.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">Documents Expiring Soon</h3>
              <p className="text-sm text-amber-700">
                {expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} will expire within 30 days. 
                Please renew these documents.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by athlete or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">No documents found</h3>
              <p className="text-sm text-muted-foreground">Upload compliance documents for your athletes.</p>
            </div>
          ) : (
            filteredDocuments.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{doc.athlete_name}</h3>
                      <p className="text-xs text-muted-foreground">{getTypeLabel(doc.document_type)}</p>
                    </div>
                  </div>
                  {getStatusBadge(doc.verification_status)}
                </div>
                
                <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Uploaded: {format(new Date(doc.upload_date), "MMM dd, yyyy")}</span>
                  </div>
                  {doc.expires_at && (
                    <div className={`flex items-center gap-2 ${isPast(new Date(doc.expires_at)) ? 'text-red-600' : ''}`}>
                      <Calendar className="h-3 w-3" />
                      <span>Expires: {format(new Date(doc.expires_at), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(doc.file_url, '_blank')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  {doc.verification_status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyDocument(doc.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceDocuments;
