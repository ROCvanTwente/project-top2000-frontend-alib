"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Smartphone } from 'lucide-react';
import Carousel from '../components/customUI/Carousel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=1200',
      title: 'Contact',
      subtitle: 'Neem contact op met NPO Radio 2'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Bericht succesvol verzonden!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <Carousel slides={carouselSlides} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8 h-fit">
            <h3 className="mb-4">Stuur ons een bericht</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2">Naam</label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Je naam"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2">E-mail</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="je@email.nl"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block mb-2">Onderwerp</label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Onderwerp"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2">Bericht</label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Typ hier je bericht..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Verzenden
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="mb-4">Contactgegevens</h3>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="mb-1">Studio</h4>
                    <p className="text-gray-600">0800-1122 (gratis)</p>
                  </div>
                </div>

                {/* App */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="mb-1">App</h4>
                    <p className="text-gray-600">
                      Bel de studio via de <strong>NPO Luister app</strong>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="mb-1">E-mail</h4>
                    <p className="text-gray-600">info@radio2.nl</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="mb-1">Adres</h4>
                    <p className="text-gray-600">
                      <strong>Postadres</strong><br />
                      Postbus 26444<br />
                      1202 JJ Hilversum
                    </p>
                    <p className="text-gray-600 mt-2">
                      <strong>Bezoekadres</strong><br />
                      Bart de Graaffweg 2<br />
                      1217 ZL Hilversum
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="mb-4">Social media</h3>
              <div className="space-y-2 text-gray-600">
                <a href="https://instagram.com/nporadio2" target="_blank">Instagram</a><br />
                <a href="https://tiktok.com/@nporadio2" target="_blank">TikTok</a><br />
                <a href="https://twitter.com/NPORadio2" target="_blank">Twitter</a><br />
                <a href="https://facebook.com/NPORadio2" target="_blank">Facebook NPO Radio 2</a><br />
                <a href="https://facebook.com/top2000" target="_blank">Facebook TOP2000</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}