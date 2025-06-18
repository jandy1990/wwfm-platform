import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SolutionCategory } from '@/lib/form-templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton';

interface HobbyFormProps {
  category: Extract<SolutionCategory, 'hobbies_activities'>;
}

export function HobbyForm({ category }: HobbyFormProps) {
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [barrierOptions, setBarrierOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', 'hobbies_activities')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setBarrierOptions(data.map(item => item.label));
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, [supabase]);
  
  const handleBarrierToggle = (barrier: string) => {
    setSelectedBarriers(prev => {
      if (prev.includes(barrier)) {
        return prev.filter(b => b !== barrier);
      }
      return [...prev, barrier];
    });
  };

  return (
    <>
      {/* Time to enjoyment */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          When did it become enjoyable? <span className="text-red-500">*</span>
        </Label>
        <Select name="time_to_enjoyment" required>
          <SelectTrigger>
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Immediately">Immediately</SelectItem>
            <SelectItem value="Within days">Within days</SelectItem>
            <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
            <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
            <SelectItem value="1-2 months">1-2 months</SelectItem>
            <SelectItem value="3+ months">3+ months</SelectItem>
            <SelectItem value="Still building enjoyment">Still building enjoyment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time commitment */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Typical time per week <span className="text-red-500">*</span>
        </Label>
        <Select name="time_commitment" required>
          <SelectTrigger>
            <SelectValue placeholder="Weekly hours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Under 2 hours">Under 2 hours</SelectItem>
            <SelectItem value="2-5 hours">2-5 hours</SelectItem>
            <SelectItem value="5-10 hours">5-10 hours</SelectItem>
            <SelectItem value="10-20 hours">10-20 hours</SelectItem>
            <SelectItem value="Over 20 hours">Over 20 hours</SelectItem>
            <SelectItem value="Varies widely">Varies widely</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cost - Dual structure */}
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
                <SelectItem value="$50-200">$50-200</SelectItem>
                <SelectItem value="$200-500">$200-500</SelectItem>
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
                <SelectItem value="Under $25/month">Under $25/month</SelectItem>
                <SelectItem value="$25-50/month">$25-50/month</SelectItem>
                <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                <SelectItem value="Over $100/month">Over $100/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <input type="hidden" name="cost_type" value="dual_cost" />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        {/* Barriers */}
        <div>
          <Label className="text-base font-medium">
            Challenges faced (optional)
          </Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md">
              {barrierOptions.map((barrier) => (
                <div key={barrier} className="flex items-center space-x-2">
                  <Checkbox
                    id={barrier}
                    checked={selectedBarriers.includes(barrier)}
                    onCheckedChange={() => handleBarrierToggle(barrier)}
                  />
                  <Label htmlFor={barrier} className="text-sm font-normal cursor-pointer">
                    {barrier}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <input 
            type="hidden" 
            name="barriers_experienced" 
            value={selectedBarriers.length > 0 ? JSON.stringify(selectedBarriers) : ''} 
          />
        </div>

        <div>
          <Label htmlFor="social_setting">Social setting</Label>
          <Select name="social_setting">
            <SelectTrigger>
              <SelectValue placeholder="Solo or social?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Always solo">Always solo</SelectItem>
              <SelectItem value="Mostly solo">Mostly solo</SelectItem>
              <SelectItem value="Mix of solo and social">Mix of solo and social</SelectItem>
              <SelectItem value="Mostly with others">Mostly with others</SelectItem>
              <SelectItem value="Always with others">Always with others</SelectItem>
              <SelectItem value="Online community">Online community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="beginner_experience">How welcoming for beginners?</Label>
          <Select name="beginner_experience">
            <SelectTrigger>
              <SelectValue placeholder="Beginner friendliness" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Very welcoming community">Very welcoming community</SelectItem>
              <SelectItem value="Welcoming">Welcoming</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Intimidating at first">Intimidating at first</SelectItem>
              <SelectItem value="Very intimidating">Very intimidating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="space_requirements">Space requirements</Label>
          <Select name="space_requirements">
            <SelectTrigger>
              <SelectValue placeholder="Space needed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No dedicated space needed">No dedicated space needed</SelectItem>
              <SelectItem value="Small space (desk/corner)">Small space (desk/corner)</SelectItem>
              <SelectItem value="Room/garage needed">Room/garage needed</SelectItem>
              <SelectItem value="Outdoor space needed">Outdoor space needed</SelectItem>
              <SelectItem value="Special venue">Special venue (studio/workshop)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="stress_level">How relaxing/stressful?</Label>
          <Select name="stress_level">
            <SelectTrigger>
              <SelectValue placeholder="Stress level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Very relaxing">Very relaxing</SelectItem>
              <SelectItem value="Mostly relaxing">Mostly relaxing</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Some pressure">Some pressure</SelectItem>
              <SelectItem value="High pressure/competitive">High pressure/competitive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
