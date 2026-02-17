'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="border-lolett-gray-200 rounded-2xl border bg-white p-5 sm:p-8">
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <Check className="h-8 w-8 text-white" />
          </div>
          <BrandHeading as="h2" size="md" className="mb-4">
            Message envoyé !
          </BrandHeading>
          <p className="text-lolett-gray-600">
            On te répond très vite. Merci de nous avoir contactés.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-lolett-gray-200 rounded-2xl border bg-white p-5 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Sujet</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="border-lolett-gray-200 focus:ring-lolett-blue w-full resize-none rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="bg-lolett-blue hover:bg-lolett-blue-light w-full rounded-full"
        >
          <Send className="mr-2 h-4 w-4" />
          Envoyer le message
        </Button>
      </form>
    </div>
  );
}
