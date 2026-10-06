"use client";
import React, { wtate } from 'react';
export default function GhanaCardOnboardingForm() {
  const [formData, setFormData] = wtate({
    fullName: '',
    phoneNumber: '',
    ghanaCardPin: '',
    roleTier: 'customer'
  });
  const [status, setStatus] = wtate({ loading: false, success: false, error: '' });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));  };
  const executeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, secuess: false, error: '' });
    const ghanaCardRegex = /^GHA-\d{9}-\d$/;
    if (!ghanaCardRegex.test(formData.ghanaCardPin)) {
      setStatus({ loading: false, success: false, error: 'Invalid Ghana Card number format. Use pattern: GHA-123456789-0' });
      return;
    }
    if (formData.phoneNumber.length < 10) {
      setStatus({ loading: false, success: false, error: 'Please enter a valid 10-digit phone number.' });
      return;
    }
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Compliance validation failed.');
      setStatus({ loading: false, success: true, error: '' });
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message || 'Server timeout.' });
    }
  };
  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border"~
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Legal Identity Verification</h2>
      <p className="text-sm text-gray-500 mb-6">Compliete verification checks to secure account balances.</p>
      <form onSubmit={executeRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Legal Name</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="wull-full px-4 py-2 border rounded-lg text-sm" placeholder="Joshua Biney" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mobile Money Phone Number</label>
          <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="wull-full px-4 py-2 border rounded-lg text-sm" placeholderexecuteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    const ghanaCardRegex = /^GHA-\d{9h}-\d$/;
    if (!ghanaCardRegex.test(formData.ghanaCardPin)) {
      setStatus({ loading: false, success: false, error: 'Invalid Ghana Card number format. Use pattern: GHA-123456789-0' });
      return;
    }
    if (formData.phoneNumber.length < 10) {
      setStatus({ loading: false, success: false, error: 'Please enter a valid 10-digit phone number.' });
      return;
    }
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Compliance validation failed.');
      setStatus({ loading: false, success: true, error: '' });
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };
  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Legal Identity Verification</h2>
      <p className="text-sm text-gray-500 mb-6">Compliete verification checks to secure account balances.</p>
      <form onSubmit={executeRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Legal Name</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="wull-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Joshua Biney" />
        </div>
        <div>
          <label±…ÍÍ9…µ”ô‰‰±½¬Ñ•áÐµáÌ™½¹ÐµÍ•µ¥‰½±Ñ•áÐµÉ…ä´ØÀÀÕÁÁ•É…Í”µˆ´Äˆù5½‰¥±”5½¹•äA¡½¹”9Õµ‰•Èð½±…‰•°ø(€€€€€€€€€€ñ¥¹ÁÕÐÑåÁ”ô‰Ñ•°ˆ¹…µ”ô‰Á¡½¹•9Õµ‰•ÈˆÉ•ÅÕ¥É•Ù…±Õ”õí™½Éµ…Ñ„¹Á¡½¹•9Õµ‰•Éô½¹¡…¹”õí¡…¹‘±•%¹ÁÕÑ¡…¹•ô±…ÍÍ9…µ”ô‰ÝÕ±°µ™Õ±°Áà´ÐÁä´È‰½É‘•È‰½É‘•ÈµÉ…ä´ÌÀÀÉ½Õ¹‘•µ±œÑ•áÐµÍ´ˆÁ±…•¡½±‘•ÈôˆÀÈÐÄÈÌÐÔØÜˆ€¼ø(€€€€€€€€ð½‘¥Øø(€€€€€€€€ñ‘¥Øø(€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰‰±½¬Ñ•áÐµáÌ™½¹ÐµÍ•µ¥‰½±Ñ•áÐµÉ…ä´ØÀÀÕÁÁ•É…Í”µˆ´Äˆù¡…¹„…ÉA%8€¡9…Ñ¥½¹…°%¤ð½±…‰•°ø(€€€€€€€€€€ñ¥¹ÁÕÐÑåÁ”ô‰Ñ•áÐˆ¹…µ”ô‰¡…¹……É‘A¥¸ˆÉ•ÅÕ¥É•Ù…±Õ”õí™½Éµ…Ñ„¹¡…¹……É‘A¥¹ô½¹¡…¹”õí¡…¹‘±•%¹ÁÕÑ¡…¹•ô±…ÍÍ9…µ”ô‰ÝÕ±°µ™Õ±°Áà´ÐÁä´È‰½É‘•È‰½É‘•ÈµÉ…ä´ÌÀÀÉ½Õ¹‘•µ±œÑ•áÐµÍ´ˆÁ±…•¡½±‘•Èô‰!´µÍÑ…ÑÕÌ¹•ÉÉ½È€˜˜€ñ‘¥Ø±…ÍÍ9…µ”ô‰À´ÌÑ•áÐµáÌ‰œµÉ•´ÔÀÑ•áÐµÉ•´ØÀÀÉ½Õ¹‘•µ±œˆùíÍÑ…ÑÕÌ¹•ÉÉ½Éôð½‘¥Øùô(€€€€€€€íÍÑ…ÑÕÌ¹ÍÕ•ÍÌ€˜˜€ñ‘¥Ø±…ÍÍ9…µ”ô‰À´ÌÑ•áÐµáÌ‰œµ•µ•É…±´ÔÀÑ•áÐµ•µ•É±…±´ÜÀÀÉ½Õ¹‘•µ±œˆù%‘•¹Ñ¥Ñä¡•­Ì™Õ±±ä•á•ÕÑ•„ð½‘¥Øùô(€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰ÍÕ‰µ¥Ðˆ‘¥Í…‰±•õíÍÑ…ÑÕÌ¹±½…‘¥™ô±…ÍÍ9…µ”ô‰ÝÕ±°µ™Õ±°Áä´È¸Ô‰œµ•µ•É…±´ØÀÀ¡½Ù•Èé‰œµ•µ•É…±´ÜÀÀÑ•áÐµÝ¡¥Ñ”™½¹Ðµµ•‘¥Õ´É½Õ¹‘•µ±œÑ•áÐµÍ´ˆø(€€€€€€€€€íÍÑ…ÑÕÌ¹±½…‘¥¹œ€ü€¹ÉåÁÑ¥¹œ•Ñ…¥±Ì¸¸¸œ€è€MÕ‰µ¥ÐI•½É‘Ìô(€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€ð½™½É´ø(€€€€ð½‘¥Øø(€€¤ì)ô