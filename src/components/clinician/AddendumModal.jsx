// components/clinician/AddendumModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, AlertCircle } from 'lucide-react';

export default function AddendumModal({ isOpen, onClose, consultationId, onSuccess }) {
    const [formData, setFormData] = useState({
        addendum_text: '',
        addendum_type: 'general',
        reason: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                addendum_text: '',
                addendum_type: 'general',
                reason: ''
            });
            setError(null);
        }
    }, [isOpen]);

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!formData.addendum_text.trim()) {
            setError('Addendum text is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const supabase = createClient();

            // Get current clinician
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: clinician } = await supabase
                .from('clinicians')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!clinician) throw new Error('No clinician record found');

            // Insert addendum
            const { data, error: insertError } = await supabase
                .from('consultation_addendums')
                .insert({
                    consultation_id: consultationId,
                    clinician_id: clinician.id,
                    addendum_text: formData.addendum_text.trim(),
                    addendum_type: formData.addendum_type,
                    reason: formData.reason.trim() || null
                })
                .select()
                .single();

            if (insertError) throw insertError;

            console.log('Addendum created:', data);
            
            // Success callback
            if (onSuccess) {
                onSuccess(data);
            }

            // Close modal
            onClose();
        } catch (err) {
            console.error('Error creating addendum:', err);
            setError(err.message || 'Failed to create addendum');
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add Addendum
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Addendum Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Addendum Type
                            </label>
                            <select
                                value={formData.addendum_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, addendum_type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="general">General Note</option>
                                <option value="correction">Correction</option>
                                <option value="clarification">Clarification</option>
                                <option value="follow_up">Follow-up</option>
                            </select>
                        </div>

                        {/* Reason (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="e.g., Patient follow-up call, Lab results received"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Addendum Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Addendum Text <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.addendum_text}
                                onChange={(e) => setFormData(prev => ({ ...prev, addendum_text: e.target.value }))}
                                placeholder="Enter additional clinical information, corrections, or follow-up notes..."
                                rows={8}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This addendum will be permanently added to the consultation record.
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> Addendums are permanent additions to the medical record. 
                                You can edit this addendum for 24 hours after creation, but it cannot be deleted.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !formData.addendum_text.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Add Addendum'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
