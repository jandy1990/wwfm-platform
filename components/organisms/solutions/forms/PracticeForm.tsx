import React, { useState, useEffect } from 'react';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Checkbox } from '@/components/atoms/checkbox';
import { SolutionCategory, COST_RANGES } from '@/lib/forms/templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';

interface PracticeFormProps {
  category: Extract<SolutionCategory, 'exercise_movement' | 'meditation_mindfulness' | 'habits_routines'>;
}

export function PracticeForm({ category }: PracticeFormProps) {
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
      {/* Cost field - Dual structure */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost? <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Startup cost</Label>
            <Select name="cost_startup" required>
              <SelectTrigger>
                <SelectValue placeholder="Initial investment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free/No startup cost">Free/No startup cost</SelectItem>
                <SelectItem value="Under $50">Under $50</SelectItem>
                <SelectItem value="$50-100">$50-100</SelectItem>
                <SelectItem value="$100-250">$100-250</SelectItem>
                <SelectItem value="$250-500">$250-500</SelectItem>
                <SelectItem value="$500-1000">$500-1000</SelectItem>
                <SelectItem value="Over $1000">Over $1000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Ongoing cost</Label>
            <Select name="cost_ongoing" required>
              <SelectTrigger>
                <SelectValue placeholder="Monthly cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free/No ongoing cost">Free/No ongoing cost</SelectItem>
                <SelectItem value="Under $10/month">Under $10/month</SelectItem>
                <SelectItem value="$10-25/month">$10-25/month</SelectItem>
                <SelectItem value="$25-50/month">$25-50/month</SelectItem>
                <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                <SelectItem value="$100-200/month">$100-200/month</SelectItem>
                <SelectItem value="Over $200/month">Over $200/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <input type="hidden" name="cost_type" value="dual_cost" />
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Challenges experienced <span className="text-red-500">*</span>
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
          name="challenges" 
          value={JSON.stringify(selectedChallenges)} 
        />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select name="frequency">
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="5-6x per week">5-6x per week</SelectItem>
              <SelectItem value="3-4x per week">3-4x per week</SelectItem>
              <SelectItem value="1-2x per week">1-2x per week</SelectItem>
              <SelectItem value="A few times per month">A few times per month</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category !== 'habits_routines' && (
          <div>
            <Label htmlFor="duration">
              {category === 'exercise_movement' ? 'Session duration' : 'Practice length'}
            </Label>
            <Select name="duration">
              <SelectTrigger>
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 10 minutes">Under 10 minutes</SelectItem>
                <SelectItem value="10-20 minutes">10-20 minutes</SelectItem>
                <SelectItem value="20-30 minutes">20-30 minutes</SelectItem>
                <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                <SelectItem value="Over 2 hours">Over 2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {category === 'habits_routines' && (
          <div>
            <Label htmlFor="time_commitment">Time commitment</Label>
            <Select name="time_commitment">
              <SelectTrigger>
                <SelectValue placeholder="Daily time needed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 5 minutes">Under 5 minutes</SelectItem>
                <SelectItem value="5-15 minutes">5-15 minutes</SelectItem>
                <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                <SelectItem value="30-60 minutes">30-60 minutes</SelectItem>
                <SelectItem value="Over 1 hour">Over 1 hour</SelectItem>
                <SelectItem value="Throughout the day">Throughout the day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="best_time_of_day">Best time of day</Label>
          <Select name="best_time_of_day">
            <SelectTrigger>
              <SelectValue placeholder="When works best?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Early morning (5-7am)">Early morning (5-7am)</SelectItem>
              <SelectItem value="Morning (7-10am)">Morning (7-10am)</SelectItem>
              <SelectItem value="Midday (10am-2pm)">Midday (10am-2pm)</SelectItem>
              <SelectItem value="Afternoon (2-5pm)">Afternoon (2-5pm)</SelectItem>
              <SelectItem value="Evening (5-8pm)">Evening (5-8pm)</SelectItem>
              <SelectItem value="Night (8pm+)">Night (8pm+)</SelectItem>
              <SelectItem value="Anytime">Anytime</SelectItem>
              <SelectItem value="Multiple times">Multiple times</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category !== 'habits_routines' && (
          <div>
            <Label htmlFor="location_setting">Location/Setting</Label>
            <Select name="location_setting">
              <SelectTrigger>
                <SelectValue placeholder="Where?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Gym/Studio">Gym/Studio</SelectItem>
                <SelectItem value="Outdoors">Outdoors</SelectItem>
                <SelectItem value="Office/Work">Office/Work</SelectItem>
                <SelectItem value="Community center">Community center</SelectItem>
                <SelectItem value="Online/Virtual">Online/Virtual</SelectItem>
                <SelectItem value="Anywhere">Anywhere</SelectItem>
                <SelectItem value="Multiple locations">Multiple locations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="guidance_type">Guidance type</Label>
          <Select name="guidance_type">
            <SelectTrigger>
              <SelectValue placeholder="How guided?" />
            </SelectTrigger>
            <SelectContent>
              {category === 'habits_routines' ? (
                <>
                  <SelectItem value="Self-directed">Self-directed</SelectItem>
                  <SelectItem value="App-assisted">App-assisted</SelectItem>
                  <SelectItem value="Book/Course-based">Book/Course-based</SelectItem>
                  <SelectItem value="Coach-supported">Coach-supported</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Self-directed">Self-directed</SelectItem>
                  <SelectItem value="App-guided">App-guided</SelectItem>
                  <SelectItem value="Video/Online class">Video/Online class</SelectItem>
                  <SelectItem value="In-person instructor">In-person instructor</SelectItem>
                  <SelectItem value="Group class">Group class</SelectItem>
                  <SelectItem value="Personal trainer/coach">Personal trainer/coach</SelectItem>
                  <SelectItem value="Mix of guided and self">Mix of guided and self</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {category !== 'habits_routines' && (
          <div>
            <Label htmlFor="difficulty_level">Difficulty level</Label>
            <Select name="difficulty_level">
              <SelectTrigger>
                <SelectValue placeholder="How challenging?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner-friendly">Beginner-friendly</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Challenging">Challenging</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Varies by day">Varies by day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="equipment_needed">Equipment/Tools needed</Label>
          <Input 
            id="equipment_needed"
            name="equipment_needed" 
            placeholder="e.g., Yoga mat, Running shoes, Journal and pen, None"
          />
        </div>
      </div>
    </>
  );
}
