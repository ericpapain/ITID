import { useState } from "react";

export interface ContactFormData {
  category: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  urgentCondition?: string;
  _website_hp?: string;
}

export interface UseContactFormReturn {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  sent: boolean;
  loading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>({
    category: "Patient",
    subject: "🩺 Première consultation d'évaluation de la douleur",
    name: "",
    email: "",
    phone: "",
    message: "",
    urgentCondition: "",
    _website_hp: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const isUrgent = formData.subject.includes("urgent") || formData.subject.includes("🚨");
    if (isUrgent && !formData.urgentCondition) {
      setError("Veuillez sélectionner la pathologie ou le geste concerné par votre situation d'urgence.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalSubject = isUrgent && formData.urgentCondition
        ? `${formData.subject} — [${formData.urgentCondition}]`
        : (formData.subject || `Demande de contact — ${formData.category}`);

      const finalMessage = isUrgent && formData.urgentCondition
        ? `[PRISE EN CHARGE URGENTE : ${formData.urgentCondition}]\n\n${formData.message}`
        : formData.message;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formName: "contact_general",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: finalSubject,
          message: finalMessage,
          metadata: {
            category: formData.category,
            subject: formData.subject,
            urgentCondition: formData.urgentCondition || "",
          },
          _website_hp: formData._website_hp,
        }),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Le serveur a renvoyé une réponse inattendue. Veuillez vérifier la configuration de l'API.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de l'envoi.");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "Patient",
      subject: "🩺 Première consultation d'évaluation de la douleur",
      name: "",
      email: "",
      phone: "",
      message: "",
      urgentCondition: "",
      _website_hp: "",
    });
    setSent(false);
    setError(null);
    setLoading(false);
  };

  return { formData, setFormData, sent, loading, error, handleSubmit, resetForm };
}

