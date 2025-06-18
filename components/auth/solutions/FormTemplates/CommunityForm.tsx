import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SolutionCategory } from '@/lib/form-templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityFormProps {
  category: Extract<SolutionCategory, 'groups_communities' | 'support_groups'>;
}

export function CommunityForm({ category }: CommunityFormProps) {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', 'groups_communities')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setChallengeOptions(data.map(item => item.label));
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, [supabase]);
  
  const handleChallengeToggle = (challenge: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challenge)) {
        return prev.filter(c => c !== challenge);
      }
      return [...prev, challenge];
    });
  };

  return (
    <>
      {/* Cost field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost? <span className="text-red-500">*</span>
        </Label>
        <Select name="cost_range" required>
          <SelectTrigger>
            <SelectValue placeholder="Select cost" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Donation-based">Donation-based</SelectItem>
            <SelectItem value="Under $20/month">Under $20/month</SelectItem>
            <SelectItem value="$20-50/month">$20-50/month</SelectItem>
            <SelectItem value="$50-100/month">$50-100/month</SelectItem>
            <SelectItem value="Over $100/month">Over $100/month</SelectItem>
            <SelectItem value="One-time fee">One-time fee (please describe)</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="cost_type" value="monthly" />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="group_size">Group size</Label>
          <Select name="group_size">
            <SelectTrigger>
              <SelectValue placeholder="How many people?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Under 10 people">Under 10 people</SelectItem>
              <SelectItem value="10-25 people">10-25 people</SelectItem>
              <SelectItem value="25-50 people">25-50 people</SelectItem>
              <SelectItem value="50-100 people">50-100 people</SelectItem>
              <SelectItem value="100+ people">100+ people</SelectItem>
              <SelectItem value="Varies significantly">Varies significantly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="meeting_frequency">Meeting frequency</Label>
          <Select name="meeting_frequency">
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Several times per week">Several times per week</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Fortnightly">Fortnightly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
              <SelectItem value="Special events only">Special events only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="format">Format</Label>
          <Select name="format">
            <SelectTrigger>
              <SelectValue placeholder="Meeting format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In-person only">In-person only</SelectItem>
              <SelectItem value="Online only">Online only</SelectItem>
              <SelectItem value="Hybrid (both)">Hybrid (both)</SelectItem>
              <SelectItem value="Phone/Conference call">Phone/Conference call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="commitment_type">Commitment type</Label>
          <Select name="commitment_type">
            <SelectTrigger>
              <SelectValue placeholder="Flexibility level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Drop-in anytime">Drop-in anytime</SelectItem>
              <SelectItem value="Regular attendance expected">Regular attendance expected</SelectItem>
              <SelectItem value="Membership required">Membership required</SelectItem>
              <SelectItem value="Course/Program">Course/Program (fixed duration)</SelectItem>
              <SelectItem value="Ongoing open group">Ongoing open group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="accessibility_level">
            {category === 'groups_communities' ? 'Beginner friendly?' : 'Newcomer welcoming?'}
          </Label>
          <Select name="accessibility_level">
            <SelectTrigger>
              <SelectValue placeholder="How welcoming?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Very welcoming">Very welcoming</SelectItem>
              <SelectItem value="Welcoming">Welcoming</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Some experience helpful">Some experience helpful</SelectItem>
              <SelectItem value="Experience required">Experience required</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category === 'support_groups' && (
          <div>
            <Label htmlFor="leadership_style">Leadership style</Label>
            <Select name="leadership_style">
              <SelectTrigger>
                <SelectValue placeholder="Group structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Peer-led">Peer-led</SelectItem>
                <SelectItem value="Professional facilitator">Professional facilitator</SelectItem>
                <SelectItem value="Rotating leadership">Rotating leadership</SelectItem>
                <SelectItem value="Mixed leadership">Mixed leadership</SelectItem>
                <SelectItem value="Self-organizing">Self-organizing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Challenges (optional) */}
        <div>
          <Label className="text-base font-medium">
            Challenges experienced (optional)
          </Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md">
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
            value={selectedChallenges.length > 0 ? JSON.stringify(selectedChallenges) : ''} 
          />
        </div>
      </div>
    </>
  );
}
