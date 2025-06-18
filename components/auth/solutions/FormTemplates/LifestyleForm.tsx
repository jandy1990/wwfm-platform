import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SolutionCategory } from '@/lib/form-templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton';

interface LifestyleFormProps {
  category: Extract<SolutionCategory, 'diet_nutrition' | 'sleep'>;
}

export function LifestyleForm({ category }: LifestyleFormProps) {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setChallengeOptions(data.map(item => item.label));
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, [category, supabase]);
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setSelectedChallenges(['None']);
    } else {
      setSelectedChallenges(prev => {
        const filtered = prev.filter(c => c !== 'None');
        if (prev.includes(challenge)) {
          const newChallenges = filtered.filter(c => c !== challenge);
          return newChallenges.length === 0 ? ['None'] : newChallenges;
        }
        return [...filtered, challenge];
      });
    }
  };

  return (
    <>
      {/* Cost Impact field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          {category === 'diet_nutrition' ? 'Cost impact?' : 'Cost?'} <span className="text-red-500">*</span>
        </Label>
        {category === 'diet_nutrition' ? (
          <Select name="cost_impact" required>
            <SelectTrigger>
              <SelectValue placeholder="Compared to previous diet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Significantly more expensive">Significantly more expensive</SelectItem>
              <SelectItem value="Somewhat more expensive">Somewhat more expensive</SelectItem>
              <SelectItem value="About the same">About the same</SelectItem>
              <SelectItem value="Somewhat less expensive">Somewhat less expensive</SelectItem>
              <SelectItem value="Significantly less expensive">Significantly less expensive</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select name="cost_range" required>
            <SelectTrigger>
              <SelectValue placeholder="Any costs?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Under $50 one-time">Under $50 one-time</SelectItem>
              <SelectItem value="$50-200 one-time">$50-200 one-time</SelectItem>
              <SelectItem value="Over $200 one-time">Over $200 one-time</SelectItem>
              <SelectItem value="Ongoing costs">Ongoing costs (please describe)</SelectItem>
            </SelectContent>
          </Select>
        )}
        <input type="hidden" name="cost_type" value={category === 'diet_nutrition' ? 'relative' : 'one_time'} />
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          {category === 'diet_nutrition' ? 'Adherence challenges' : 'Adjustment difficulties'} <span className="text-red-500">*</span>
        </Label>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border rounded-md">
            {challengeOptions.map((challenge) => (
              <div key={challenge} className="flex items-center space-x-2">
                <Checkbox
                  id={challenge}
                  checked={selectedChallenges.includes(challenge)}
                  onCheckedChange={() => handleChallengeToggle(challenge)}
                />
                <Label htmlFor={challenge} className="text-sm font-normal cursor-pointer">
                  {challenge}
                </Label>
              </div>
            ))}
          </div>
        )}
        <input 
          type="hidden" 
          name="challenges_experienced" 
          value={JSON.stringify(selectedChallenges)} 
        />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="preparation_adjustment_time">
            {category === 'diet_nutrition' ? 'Daily prep time' : 'Adjustment period'}
          </Label>
          <Select name="preparation_adjustment_time">
            <SelectTrigger>
              <SelectValue placeholder="Time needed" />
            </SelectTrigger>
            <SelectContent>
              {category === 'diet_nutrition' ? (
                <>
                  <SelectItem value="No extra time">No extra time</SelectItem>
                  <SelectItem value="Under 15 minutes">Under 15 minutes</SelectItem>
                  <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                  <SelectItem value="30-60 minutes">30-60 minutes</SelectItem>
                  <SelectItem value="Over 1 hour">Over 1 hour</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="3-7 days">3-7 days</SelectItem>
                  <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                  <SelectItem value="Over a month">Over a month</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="long_term_sustainability">Long-term sustainability</Label>
          <Select name="long_term_sustainability">
            <SelectTrigger>
              <SelectValue placeholder="How sustainable?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Still maintaining">Still maintaining</SelectItem>
              <SelectItem value="Maintained for years">Maintained for years</SelectItem>
              <SelectItem value="Maintained 6-12 months">Maintained 6-12 months</SelectItem>
              <SelectItem value="Maintained 3-6 months">Maintained 3-6 months</SelectItem>
              <SelectItem value="Maintained 1-3 months">Maintained 1-3 months</SelectItem>
              <SelectItem value="Stopped within a month">Stopped within a month</SelectItem>
              <SelectItem value="Modified but continued">Modified but continued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category === 'diet_nutrition' && (
          <div>
            <Label htmlFor="social_impact">Social impact</Label>
            <Select name="social_impact">
              <SelectTrigger>
                <SelectValue placeholder="Social challenges?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No impact">No impact</SelectItem>
                <SelectItem value="Slightly challenging">Slightly challenging</SelectItem>
                <SelectItem value="Moderately challenging">Moderately challenging</SelectItem>
                <SelectItem value="Very challenging">Very challenging</SelectItem>
                <SelectItem value="Deal breaker">Deal breaker</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {category === 'sleep' && (
          <div>
            <Label htmlFor="previous_sleep_hours">Previous sleep hours</Label>
            <Select name="previous_sleep_hours">
              <SelectTrigger>
                <SelectValue placeholder="Before this change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 4 hours">Under 4 hours</SelectItem>
                <SelectItem value="4-5 hours">4-5 hours</SelectItem>
                <SelectItem value="5-6 hours">5-6 hours</SelectItem>
                <SelectItem value="6-7 hours">6-7 hours</SelectItem>
                <SelectItem value="7-8 hours">7-8 hours</SelectItem>
                <SelectItem value="Over 8 hours">Over 8 hours</SelectItem>
                <SelectItem value="Highly variable">Highly variable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
}
