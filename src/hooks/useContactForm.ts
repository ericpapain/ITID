import { useState } from "react";

export interface ContactFormData {
  category: string;
  name: string;
  email: string;
  phone: string;
  message: string;
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
    name: "",
    email: "",
    phone: "",
    message: "",
    _website_hp: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
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
          subject: `Demande de contact — ${formData.category}`,
          message: formData.message,
          metadata: {
            category: formData.category,
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
      name: "",
      email: "",
      phone: "",
      message: "",
      _website_hp: "",
    });
    setSent(false);
    setError(null);
    setLoading(false);
  };

  return { formData, setFormData, sent, loading, error, handleSubmit, resetForm };
}
