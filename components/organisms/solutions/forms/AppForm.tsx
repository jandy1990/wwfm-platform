import React, { useState, useEffect } from 'react';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Checkbox } from '@/components/atoms/checkbox';
import { SolutionCategory } from '@/lib/forms/templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';

interface AppFormProps {
  category: Extract<SolutionCategory, 'apps_software'>;
}

export function AppForm({ category }: AppFormProps) {
  const [costType, setCostType] = useState<'one_time' | 'subscription'>('subscription');
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    setLoading(true);
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', 'apps_software')
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
      {/* Cost field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost? <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={costType} onValueChange={(value) => setCostType(value as 'one_time' | 'subscription')}>
          <div className="flex gap-4">
            <div className="flex items-center">
              <RadioGroupItem value="one_time" id="one_time_app" />
              <Label htmlFor="one_time_app" className="ml-2">One-time purchase</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem value="subscription" id="subscription_app" />
              <Label htmlFor="subscription_app" className="ml-2">Subscription</Label>
            </div>
          </div>
        </RadioGroup>
        
        <Select name="cost_range" required>
          <SelectTrigger>
            <SelectValue placeholder="Select cost range" />
          </SelectTrigger>
          <SelectContent>
            {costType === 'one_time' ? (
              <>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Under $5">Under $5</SelectItem>
                <SelectItem value="$5-10">$5-10</SelectItem>
                <SelectItem value="$10-20">$10-20</SelectItem>
                <SelectItem value="$20-50">$20-50</SelectItem>
                <SelectItem value="Over $50">Over $50</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Free with ads">Free with ads</SelectItem>
                <SelectItem value="Under $5/month">Under $5/month</SelectItem>
                <SelectItem value="$5-10/month">$5-10/month</SelectItem>
                <SelectItem value="$10-20/month">$10-20/month</SelectItem>
                <SelectItem value="$20-50/month">$20-50/month</SelectItem>
                <SelectItem value="Over $50/month">Over $50/month</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <input type="hidden" name="cost_type" value={costType} />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="usage_frequency">Usage frequency</Label>
          <Select name="usage_frequency">
            <SelectTrigger>
              <SelectValue placeholder="How often used?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Multiple times daily">Multiple times daily</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Several times a week">Several times a week</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
              <SelectItem value="Rarely after initial use">Rarely after initial use</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subscription_type">Subscription type</Label>
          <Select name="subscription_type">
            <SelectTrigger>
              <SelectValue placeholder="Access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Free version">Free version</SelectItem>
              <SelectItem value="Premium/Pro">Premium/Pro</SelectItem>
              <SelectItem value="Trial period">Trial period</SelectItem>
              <SelectItem value="Lifetime purchase">Lifetime purchase</SelectItem>
              <SelectItem value="Not applicable">Not applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="most_valuable_feature">Most valuable feature</Label>
          <Select name="most_valuable_feature">
            <SelectTrigger>
              <SelectValue placeholder="What helped most?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Guided sessions">Guided sessions</SelectItem>
              <SelectItem value="Progress tracking">Progress tracking</SelectItem>
              <SelectItem value="Reminders/Notifications">Reminders/Notifications</SelectItem>
              <SelectItem value="Community features">Community features</SelectItem>
              <SelectItem value="Content library">Content library</SelectItem>
              <SelectItem value="Customization options">Customization options</SelectItem>
              <SelectItem value="Offline access">Offline access</SelectItem>
              <SelectItem value="Integration with other apps">Integration with other apps</SelectItem>
              <SelectItem value="Other">Other (please describe)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenges field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Challenges experienced? <span className="text-red-500">*</span>
        </Label>
        {loading ? (
          <div className="space-y-2">
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
          name="challenges" 
          value={JSON.stringify(selectedChallenges)} 
        />
      </div>
    </>
  );
}
