import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SolutionCategory } from '@/lib/form-templates';

interface FinancialFormProps {
  category: Extract<SolutionCategory, 'financial_products'>;
}

export function FinancialForm({ category }: FinancialFormProps) {
  const [costType, setCostType] = useState<string>('No cost');
  const [feeType, setFeeType] = useState<string>('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(['None']);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleRequirementToggle = (requirement: string) => {
    if (requirement === 'None') {
      setSelectedRequirements(['None']);
    } else {
      setSelectedRequirements(prev => {
        const filtered = prev.filter(r => r !== 'None');
        if (prev.includes(requirement)) {
          const newRequirements = filtered.filter(r => r !== requirement);
          return newRequirements.length === 0 ? ['None'] : newRequirements;
        }
        return [...filtered, requirement];
      });
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      }
      return [...prev, feature];
    });
  };

  return (
    <>
      {/* Cost Type */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost type? <span className="text-red-500">*</span>
        </Label>
        <Select value={costType} onValueChange={setCostType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select cost type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No cost">No cost</SelectItem>
            <SelectItem value="Fees only">Fees only</SelectItem>
            <SelectItem value="Interest only">Interest only (APR)</SelectItem>
            <SelectItem value="Fees plus interest">Fees plus interest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Fee Amount */}
      {(costType === 'Fees only' || costType === 'Fees plus interest') && (
        <div className="space-y-2">
          <Label>Fee type</Label>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger>
              <SelectValue placeholder="Select fee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly fees</SelectItem>
              <SelectItem value="annual">Annual fees</SelectItem>
              <SelectItem value="one_time">One-time fees</SelectItem>
            </SelectContent>
          </Select>

          {feeType && (
            <Select name="fee_amount">
              <SelectTrigger>
                <SelectValue placeholder="Select fee amount" />
              </SelectTrigger>
              <SelectContent>
                {feeType === 'monthly' && (
                  <>
                    <SelectItem value="Under $10/month">Under $10/month</SelectItem>
                    <SelectItem value="$10-25/month">$10-25/month</SelectItem>
                    <SelectItem value="$25-50/month">$25-50/month</SelectItem>
                    <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                    <SelectItem value="Over $100/month">Over $100/month</SelectItem>
                  </>
                )}
                {feeType === 'annual' && (
                  <>
                    <SelectItem value="Under $100/year">Under $100/year</SelectItem>
                    <SelectItem value="$100-500/year">$100-500/year</SelectItem>
                    <SelectItem value="Over $500/year">Over $500/year</SelectItem>
                  </>
                )}
                {feeType === 'one_time' && (
                  <>
                    <SelectItem value="Under $100">Under $100 one-time</SelectItem>
                    <SelectItem value="$100-500">$100-500 one-time</SelectItem>
                    <SelectItem value="$500-2500">$500-2500 one-time</SelectItem>
                    <SelectItem value="Over $2500">Over $2500 one-time</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Conditional Interest Rate */}
      {(costType === 'Interest only' || costType === 'Fees plus interest') && (
        <div className="space-y-2">
          <Label htmlFor="interest_rate_exact">Interest Rate (APR)</Label>
          <Input
            id="interest_rate_exact"
            name="interest_rate_exact"
            placeholder="e.g., 6.75% or 0% promotional"
          />
          <p className="text-sm text-gray-500">Enter exact rate or 'Variable' if it changes</p>
        </div>
      )}

      <input type="hidden" name="cost_type" value={costType} />
      <input type="hidden" name="fee_type" value={feeType} />

      {/* Financial Benefit */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Financial benefit? <span className="text-red-500">*</span>
        </Label>
        <Select name="financial_benefit" required>
          <SelectTrigger>
            <SelectValue placeholder="Savings or earnings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No direct financial benefit">No direct financial benefit</SelectItem>
            <SelectItem value="Under $25/month saved/earned">Under $25/month saved/earned</SelectItem>
            <SelectItem value="$25-100/month saved/earned">$25-100/month saved/earned</SelectItem>
            <SelectItem value="$100-250/month saved/earned">$100-250/month saved/earned</SelectItem>
            <SelectItem value="$250-500/month saved/earned">$250-500/month saved/earned</SelectItem>
            <SelectItem value="$500-1000/month saved/earned">$500-1000/month saved/earned</SelectItem>
            <SelectItem value="Over $1000/month saved/earned">Over $1000/month saved/earned</SelectItem>
            <SelectItem value="Varies significantly">Varies significantly (explain in notes)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        {/* Minimum Requirements */}
        <div>
          <Label className="text-base font-medium">Minimum requirements</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md">
            {[
              'None',
              'Minimum balance ($500+)',
              'Minimum balance ($1000+)',
              'Minimum balance ($5000+)',
              'Good credit (650+)',
              'Excellent credit (750+)',
              'Proof of income',
              'Business entity',
              'Collateral required',
              'Other requirements (please describe)'
            ].map((requirement) => (
              <div key={requirement} className="flex items-center space-x-2">
                <Checkbox
                  id={requirement}
                  checked={selectedRequirements.includes(requirement)}
                  onCheckedChange={() => handleRequirementToggle(requirement)}
                />
                <Label htmlFor={requirement} className="text-sm font-normal cursor-pointer">
                  {requirement}
                </Label>
              </div>
            ))}
          </div>
          <input 
            type="hidden" 
            name="minimum_requirements" 
            value={JSON.stringify(selectedRequirements)} 
          />
        </div>

        {/* Key Features/Benefits */}
        <div>
          <Label className="text-base font-medium">Key features/benefits</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md">
            {[
              'No fees',
              'Cashback/rewards',
              'High interest earned',
              'Low interest charged',
              'Flexible terms',
              'Quick approval',
              'No credit check',
              'Mobile app access',
              'Automatic savings',
              'Bill negotiation',
              'Tax advantages',
              'FDIC/SIPC insured',
              'Other (please describe)'
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label htmlFor={feature} className="text-sm font-normal cursor-pointer">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
          <input 
            type="hidden" 
            name="key_features" 
            value={selectedFeatures.length > 0 ? JSON.stringify(selectedFeatures) : ''} 
          />
        </div>

        <div>
          <Label htmlFor="access_time">Access time</Label>
          <Select name="access_time">
            <SelectTrigger>
              <SelectValue placeholder="How quickly available?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instant approval">Instant approval</SelectItem>
              <SelectItem value="Same day">Same day</SelectItem>
              <SelectItem value="1-3 business days">1-3 business days</SelectItem>
              <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
              <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
              <SelectItem value="Over a month">Over a month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ease_of_use">Ease of use</Label>
          <Select name="ease_of_use">
            <SelectTrigger>
              <SelectValue placeholder="How easy?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Very easy">Very easy</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Complex">Complex</SelectItem>
              <SelectItem value="Very complex">Very complex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
