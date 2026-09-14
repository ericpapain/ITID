import { useState } from "react";

interface ContactFormData {
  category: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  sent: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>({
    category: "Patient",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return { formData, setFormData, sent, handleSubmit };
}
