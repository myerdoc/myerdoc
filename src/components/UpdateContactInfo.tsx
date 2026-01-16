'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPhone } from '@/lib/format/phone';

interface ContactInfoProps {
  personId: string;
  currentPhone: string | null;
  currentAddress: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  };
}

export default function UpdateContactInfo({ personId, currentPhone, currentAddress }: ContactInfoProps) {
  const [phone, setPhone] = useState(currentPhone || '');
  const [addressLine1, setAddressLine1] = useState(currentAddress.line1 || '');
  const [addressLine2, setAddressLine2] = useState(currentAddress.line2 || '');
  const [city, setCity] = useState(currentAddress.city || '');
  const [state, setState] = useState(currentAddress.state || '');
  const [postalCode, setPostalCode] = useState(currentAddress.postalCode || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const supabase = createClient();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!phone) {
      setMessage({ type: 'error', text: 'Phone number is required' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('people')
        .update({
          phone,
          address_line1: addressLine1 || null,
          address_line2: addressLine2 || null,
          city: city || null,
          state: state || null,
          postal_code: postalCode || null,
        })
        .eq('id', personId);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Contact information updated successfully' });

    } catch (error: any) {
      console.error('Error updating contact info:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update contact information. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium leading-6 text-slate-900">
        Contact Information
      </h3>
      <div className="mt-2 text-sm text-slate-600">
        <p>
          Update your phone number and mailing address.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="address-line1" className="block text-sm font-medium text-slate-700">
            Address Line 1
          </label>
          <input
            type="text"
            id="address-line1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="123 Main St"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="address-line2" className="block text-sm font-medium text-slate-700">
            Address Line 2
          </label>
          <input
            type="text"
            id="address-line2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt 4B"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3">
            <label htmlFor="city" className="block text-sm font-medium text-slate-700">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled={loading}
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="state" className="block text-sm font-medium text-slate-700">
              State
            </label>
            <input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="UT"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled={loading}
            />
          </div>

          <div className="col-span-1">
            <label htmlFor="postal-code" className="block text-sm font-medium text-slate-700">
              ZIP
            </label>
            <input
              type="text"
              id="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={10}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Contact Information'}
          </button>
        </div>
      </form>
    </section>
  );
}