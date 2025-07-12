import React, { useState, useEffect } from 'react';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Checkbox } from '@/components/atoms/checkbox';
import { SolutionCategory, COST_RANGES } from '@/lib/forms/templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';

interface SessionFormProps {
  category: Extract<SolutionCategory, 
    'therapists_counselors' | 'doctors_specialists' | 'coaches_mentors' | 
    'alternative_practitioners' | 'professional_services' | 'medical_procedures' | 'crisis_resources'
  >;
}

export function SessionForm({ category }: SessionFormProps) {
  const [costType, setCostType] = useState<'per_session' | 'monthly' | 'total'>('per_session');
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['None']);
  const [sideEffectOptions, setSideEffectOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClientComponentClient();
  
  // Only show side effects for medical procedures and alternative practitioners
  const showSideEffects = ['medical_procedures', 'alternative_practitioners'].includes(category);
  
  useEffect(() => {
    if (showSideEffects) {
      setLoading(true);
      const fetchOptions = async () => {
        const { data, error } = await supabase
          .from('side_effect_options')
          .select('label')
          .eq('category', category)
          .eq('is_active', true)
          .order('display_order');
        
        if (!error && data) {
          setSideEffectOptions(data.map(item => item.label));
        }
        setLoading(false);
      };
      
      fetchOptions();
    }
  }, [category, showSideEffects, supabase]);
  
  const handleSideEffectToggle = (effect: string) => {
    if (effect === 'None') {
      setSelectedSideEffects(['None']);
    } else {
      setSelectedSideEffects(prev => {
        const filtered = prev.filter(e => e !== 'None');
        if (prev.includes(effect)) {
          const newEffects = filtered.filter(e => e !== effect);
          return newEffects.length === 0 ? ['None'] : newEffects;
        }
        return [...filtered, effect];
      });
    }
  };

  // Different cost options for different categories
  const getCostOptions = () => {
    if (category === 'crisis_resources') {
      return ['Free', 'Donation-based', 'Sliding scale'];
    }
    if (category === 'medical_procedures') {
      return costType === 'total' ? COST_RANGES.one_time : COST_RANGES.monthly;
    }
    return COST_RANGES[costType as keyof typeof COST_RANGES] || COST_RANGES.per_session;
  };

  return (
    <>
      {/* Cost field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost? <span className="text-red-500">*</span>
        </Label>
        
        {category !== 'crisis_resources' && (
          <RadioGroup value={costType} onValueChange={(value) => setCostType(value as any)}>
            <div className="flex gap-4">
              <div className="flex items-center">
                <RadioGroupItem value="per_session" id="per_session" />
                <Label htmlFor="per_session" className="ml-2">Per session</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="ml-2">Monthly</Label>
              </div>
              {category === 'medical_procedures' && (
                <div className="flex items-center">
                  <RadioGroupItem value="total" id="total" />
                  <Label htmlFor="total" className="ml-2">Total cost</Label>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        
        <Select name="cost_range" required>
          <SelectTrigger>
            <SelectValue placeholder="Select cost range" />
          </SelectTrigger>
          <SelectContent>
            {getCostOptions().map(range => (
              <SelectItem key={range} value={range}>{range}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="cost_type" value={costType} />
      </div>

      {/* Side Effects (only for medical procedures and alternative practitioners) */}
      {showSideEffects && (
        <div className="space-y-2">
          <Label className="text-base font-medium">
            {category === 'medical_procedures' ? 'Side Effects/Risks' : 'Side Effects'} <span className="text-red-500">*</span>
          </Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border rounded-md">
              {sideEffectOptions.map((effect) => (
                <div key={effect} className="flex items-center space-x-2">
                  <Checkbox
                    id={effect}
                    checked={selectedSideEffects.includes(effect)}
                    onCheckedChange={() => handleSideEffectToggle(effect)}
                  />
                  <Label htmlFor={effect} className="text-sm font-normal cursor-pointer">
                    {effect}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <input 
            type="hidden" 
            name="side_effects" 
            value={JSON.stringify(selectedSideEffects)} 
          />
        </div>
      )}

      {/* Optional fields */}
      <div className="space-y-4">
        {category !== 'crisis_resources' && (
          <div>
            <Label htmlFor="session_frequency">
              {category === 'medical_procedures' ? 'Treatment frequency' : 'Session frequency'}
            </Label>
            <Select name="session_frequency">
              <SelectTrigger>
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="One-time only">One-time only</SelectItem>
                <SelectItem value="As needed">As needed</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Every 2-3 months">Every 2-3 months</SelectItem>
                <SelectItem value="Multiple times per week">Multiple times per week</SelectItem>
                <SelectItem value="Other">Other (please describe)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="format">Format</Label>
          <Select name="format">
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {category === 'crisis_resources' ? (
                <>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Text/Chat">Text/Chat</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </>
              ) : category === 'medical_procedures' ? (
                <>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                  <SelectItem value="Inpatient">Inpatient</SelectItem>
                  <SelectItem value="In-office">In-office</SelectItem>
                  <SelectItem value="At-home">At-home</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Virtual/Online">Virtual/Online</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Hybrid">Hybrid (both)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {!['crisis_resources', 'medical_procedures'].includes(category) && (
          <div>
            <Label htmlFor="session_length">Session length</Label>
            <Select name="session_length">
              <SelectTrigger>
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 minutes">15 minutes</SelectItem>
                <SelectItem value="30 minutes">30 minutes</SelectItem>
                <SelectItem value="45 minutes">45 minutes</SelectItem>
                <SelectItem value="60 minutes">60 minutes</SelectItem>
                <SelectItem value="90 minutes">90 minutes</SelectItem>
                <SelectItem value="2+ hours">2+ hours</SelectItem>
                <SelectItem value="Varies">Varies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {['therapists_counselors', 'doctors_specialists', 'medical_procedures'].includes(category) && (
          <div>
            <Label htmlFor="insurance_coverage">Insurance coverage</Label>
            <Select name="insurance_coverage">
              <SelectTrigger>
                <SelectValue placeholder="Coverage status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fully covered">Fully covered</SelectItem>
                <SelectItem value="Partially covered">Partially covered</SelectItem>
                <SelectItem value="Not covered">Not covered</SelectItem>
                <SelectItem value="Don't have insurance">Don't have insurance</SelectItem>
                <SelectItem value="HSA/FSA eligible">HSA/FSA eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {['doctors_specialists', 'medical_procedures'].includes(category) && (
          <div>
            <Label htmlFor="wait_time">Wait time</Label>
            <Select name="wait_time">
              <SelectTrigger>
                <SelectValue placeholder="Time to get appointment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Same day">Same day</SelectItem>
                <SelectItem value="Within a week">Within a week</SelectItem>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-2 months">1-2 months</SelectItem>
                <SelectItem value="2+ months">2+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {['therapists_counselors', 'coaches_mentors', 'medical_procedures'].includes(category) && (
          <div>
            <Label htmlFor="completed_full_treatment">Completed full treatment?</Label>
            <RadioGroup name="completed_full_treatment">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <RadioGroupItem value="Yes" id="completed_yes" />
                  <Label htmlFor="completed_yes" className="ml-2">Yes</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="No" id="completed_no" />
                  <Label htmlFor="completed_no" className="ml-2">No</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="Still ongoing" id="completed_ongoing" />
                  <Label htmlFor="completed_ongoing" className="ml-2">Still ongoing</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {!['professional_services', 'crisis_resources'].includes(category) && (
          <div>
            <Label htmlFor="typical_treatment_length">Typical treatment length</Label>
            <Select name="typical_treatment_length">
              <SelectTrigger>
                <SelectValue placeholder="How long overall?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single session only">Single session only</SelectItem>
                <SelectItem value="4-6 sessions">4-6 sessions</SelectItem>
                <SelectItem value="8-12 sessions">8-12 sessions</SelectItem>
                <SelectItem value="3-6 months">3-6 months</SelectItem>
                <SelectItem value="6-12 months">6-12 months</SelectItem>
                <SelectItem value="Ongoing/Indefinite">Ongoing/Indefinite</SelectItem>
                <SelectItem value="Varies significantly">Varies significantly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {category === 'crisis_resources' && (
          <div>
            <Label htmlFor="availability">Availability</Label>
            <div className="space-y-2">
              {['24/7', 'Business hours', 'Evenings', 'Weekends', 'Immediate response', 'Callback within 24hrs'].map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox id={option} name="availability" value={option} />
                  <Label htmlFor={option} className="text-sm font-normal">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
