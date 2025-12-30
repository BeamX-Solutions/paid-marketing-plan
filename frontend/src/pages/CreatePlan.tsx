import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PlanFormData } from '../types';
import { plansAPI } from '../services/api';

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PlanFormData>({
    businessName: '',
    industry: '',
    targetAudience: '',
    budget: 0,
    timeframe: '',
    goals: [],
    additionalInfo: ''
  });
  
  const [goalInput, setGoalInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    });
  };

  const addGoal = () => {
    if (goalInput.trim() && !formData.goals.includes(goalInput.trim())) {
      setFormData({
        ...formData,
        goals: [...formData.goals, goalInput.trim()]
      });
      setGoalInput('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.goals.length === 0) {
      setError('Please add at least one marketing goal');
      return;
    }

    setLoading(true);

    try {
      const response = await plansAPI.create(formData);
      
      if (response.success && response.data) {
        navigate(`/plans/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to create plan');
      }
    } catch (err) {
      setError('Failed to create plan. Please try again.');
      console.error('Create plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Marketing Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="card space-y-6">
          <div className="form-group">
            <label htmlFor="businessName" className="form-label">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              className="form-input"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">
              Industry *
            </label>
            <select
              id="industry"
              name="industry"
              required
              className="form-select"
              value={formData.industry}
              onChange={handleInputChange}
            >
              <option value="">Select an industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="retail">Retail</option>
              <option value="education">Education</option>
              <option value="food-beverage">Food & Beverage</option>
              <option value="real-estate">Real Estate</option>
              <option value="consulting">Consulting</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience" className="form-label">
              Target Audience *
            </label>
            <textarea
              id="targetAudience"
              name="targetAudience"
              required
              rows={3}
              className="form-textarea"
              placeholder="Describe your target audience (demographics, interests, behaviors, etc.)"
              value={formData.targetAudience}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="budget" className="form-label">
              Marketing Budget (USD) *
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              required
              min="0"
              step="100"
              className="form-input"
              placeholder="Enter your marketing budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeframe" className="form-label">
              Timeframe *
            </label>
            <select
              id="timeframe"
              name="timeframe"
              required
              className="form-select"
              value={formData.timeframe}
              onChange={handleInputChange}
            >
              <option value="">Select timeframe</option>
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
              <option value="2-years">2 Years</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Marketing Goals *
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Enter a marketing goal and press Add"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <button
                type="button"
                onClick={addGoal}
                className="btn btn-secondary"
                disabled={!goalInput.trim()}
              >
                Add
              </button>
            </div>
            
            {formData.goals.length > 0 && (
              <div className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm">{goal}</span>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={4}
              className="form-textarea"
              placeholder="Any additional information about your business, competition, or specific requirements..."
              value={formData.additionalInfo}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2" style={{ width: '16px', height: '16px' }}></div>
                Creating Plan...
              </div>
            ) : (
              'Create Plan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;