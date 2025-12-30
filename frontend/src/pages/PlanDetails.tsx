import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Mail, Trash2, Download } from 'lucide-react';
import { MarketingPlan } from '../types';
import { plansAPI, analyticsAPI, emailAPI } from '../services/api';

const PlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await plansAPI.getById(id);
      
      if (response.success && response.data) {
        setPlan(response.data);
      } else {
        setError('Plan not found');
      }
    } catch (err) {
      setError('Failed to load plan');
      console.error('Load plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!id || !plan) return;

    try {
      setGenerating(true);
      setError('');
      
      const response = await plansAPI.generate(id);
      
      if (response.success && response.data) {
        setPlan(response.data);
        setSuccess('Marketing plan generated successfully!');
        
        await analyticsAPI.track('plan_generated', {
          planId: id,
          businessName: plan.businessName
        });
      } else {
        setError('Failed to generate plan');
      }
    } catch (err) {
      setError('Failed to generate plan');
      console.error('Generate plan error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const deletePlan = async () => {
    if (!id || !plan) return;
    
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const response = await plansAPI.delete(id);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError('Failed to delete plan');
      }
    } catch (err) {
      setError('Failed to delete plan');
      console.error('Delete plan error:', err);
    }
  };

  const sendEmail = async () => {
    if (!id || !emailData.email.trim()) return;

    try {
      const response = await emailAPI.sendPlan(id, emailData.email, emailData.message || undefined);
      
      if (response.success) {
        setSuccess('Plan sent successfully!');
        setEmailModal(false);
        setEmailData({ email: '', message: '' });
      } else {
        setError('Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
      console.error('Send email error:', err);
    }
  };

  const downloadPlan = () => {
    if (!plan || !plan.content) return;

    const element = document.createElement('a');
    const file = new Blob([plan.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${plan.businessName.replace(/\s+/g, '_')}_Marketing_Plan.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.businessName}</h1>
            <p className="text-gray-600">{plan.industry} • {plan.timeframe}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {plan.status === 'completed' && plan.content && (
            <>
              <button
                onClick={downloadPlan}
                className="btn btn-secondary inline-flex items-center"
              >
                <Download className="mr-2" size={16} />
                Download
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="btn btn-secondary inline-flex items-center"
              >
                <Mail className="mr-2" size={16} />
                Share
              </button>
            </>
          )}
          <button
            onClick={deletePlan}
            className="btn text-red-600 hover:bg-red-50 border border-red-200 inline-flex items-center"
          >
            <Trash2 className="mr-2" size={16} />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Plan Details</h3>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Audience</h4>
              <p className="text-gray-600 text-sm">{plan.targetAudience}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
              <p className="text-gray-600 text-sm">${plan.budget.toLocaleString()}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
              <ul className="space-y-1">
                {plan.goals.map((goal, index) => (
                  <li key={index} className="text-gray-600 text-sm">
                    • {goal}
                  </li>
                ))}
              </ul>
            </div>

            {plan.additionalInfo && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <p className="text-gray-600 text-sm">{plan.additionalInfo}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'completed' ? 'text-green-600 bg-green-100' :
                plan.status === 'generating' ? 'text-blue-600 bg-blue-100' :
                plan.status === 'error' ? 'text-red-600 bg-red-100' :
                'text-gray-600 bg-gray-100'
              }`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Generated Marketing Plan</h3>
              
              {plan.status !== 'completed' && (
                <button
                  onClick={generatePlan}
                  disabled={generating || plan.status === 'generating'}
                  className="btn btn-primary inline-flex items-center"
                >
                  <Play className="mr-2" size={16} />
                  {generating || plan.status === 'generating' ? 'Generating...' : 'Generate Plan'}
                </button>
              )}
            </div>

            {plan.status === 'generating' && (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your marketing plan...</p>
              </div>
            )}

            {plan.status === 'error' && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Failed to generate plan</p>
                <button
                  onClick={generatePlan}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {plan.content && plan.status === 'completed' && (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {plan.content}
                </pre>
              </div>
            )}

            {!plan.content && plan.status === 'draft' && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Ready to generate your marketing plan?</p>
                <button
                  onClick={generatePlan}
                  className="btn btn-primary inline-flex items-center"
                >
                  <Play className="mr-2" size={16} />
                  Generate Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {emailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Share Marketing Plan</h3>
            
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="recipientEmail" className="form-label">
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  className="form-input"
                  placeholder="Enter recipient's email"
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailMessage" className="form-label">
                  Message (optional)
                </label>
                <textarea
                  id="emailMessage"
                  rows={3}
                  className="form-textarea"
                  placeholder="Add a personal message..."
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEmailModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={!emailData.email.trim()}
                className="btn btn-primary flex-1"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetails;