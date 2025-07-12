import React, { useState, useEffect } from 'react';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Checkbox } from '@/components/atoms/checkbox';
import { SolutionCategory, COST_RANGES } from '@/lib/forms/templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';

interface PurchaseFormProps {
  category: Extract<SolutionCategory, 'products_devices' | 'books_courses'>;
}

export function PurchaseForm({ category }: PurchaseFormProps) {
  const [costType, setCostType] = useState<'one_time' | 'subscription'>('one_time');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [issueOptions, setIssueOptions] = useState<string[]>([]);
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
        setIssueOptions(data.map(item => item.label));
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, [category, supabase]);
  
  const handleIssueToggle = (issue: string) => {
    setSelectedIssues(prev => {
      if (prev.includes(issue)) {
        return prev.filter(i => i !== issue);
      }
      return [...prev, issue];
    });
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
              <RadioGroupItem value="one_time" id="one_time_purchase" />
              <Label htmlFor="one_time_purchase" className="ml-2">One-time purchase</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem value="subscription" id="subscription" />
              <Label htmlFor="subscription" className="ml-2">
                {category === 'products_devices' ? 'Ongoing costs' : 'Subscription'}
              </Label>
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
                <SelectItem value="Under $20">Under $20</SelectItem>
                <SelectItem value="$20-50">$20-50</SelectItem>
                <SelectItem value="$50-100">$50-100</SelectItem>
                <SelectItem value="$100-250">$100-250</SelectItem>
                <SelectItem value="$250-500">$250-500</SelectItem>
                <SelectItem value="$500-1000">$500-1000</SelectItem>
                <SelectItem value="Over $1000">Over $1000</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Under $10/month">Under $10/month</SelectItem>
                <SelectItem value="$10-25/month">$10-25/month</SelectItem>
                <SelectItem value="$25-50/month">$25-50/month</SelectItem>
                <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                <SelectItem value="Over $100/month">Over $100/month</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <input type="hidden" name="cost_type" value={costType} />
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="format_type">
            {category === 'products_devices' ? 'Product type' : 'Format'}
          </Label>
          <Select name="format_type">
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {category === 'products_devices' ? (
                <>
                  <SelectItem value="Physical device">Physical device</SelectItem>
                  <SelectItem value="Mobile app">Mobile app</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Wearable">Wearable</SelectItem>
                  <SelectItem value="Subscription service">Subscription service</SelectItem>
                  <SelectItem value="Other">Other (please describe)</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Physical book">Physical book</SelectItem>
                  <SelectItem value="E-book">E-book</SelectItem>
                  <SelectItem value="Audiobook">Audiobook</SelectItem>
                  <SelectItem value="Online course">Online course</SelectItem>
                  <SelectItem value="Video series">Video series</SelectItem>
                  <SelectItem value="Workbook/PDF">Workbook/PDF</SelectItem>
                  <SelectItem value="App-based">App-based</SelectItem>
                  <SelectItem value="Other">Other (please describe)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {category === 'products_devices' && (
          <div>
            <Label htmlFor="ease_of_use">Ease of use</Label>
            <Select name="ease_of_use">
              <SelectTrigger>
                <SelectValue placeholder="How easy to use?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Very easy">Very easy</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Difficult">Difficult</SelectItem>
                <SelectItem value="Very difficult">Very difficult</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {category === 'books_courses' && (
          <>
            <div>
              <Label htmlFor="learning_difficulty">Learning difficulty</Label>
              <Select name="learning_difficulty">
                <SelectTrigger>
                  <SelectValue placeholder="How challenging?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Very easy">Very easy</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Just right">Just right</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Too difficult">Too difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="completion_status">Completion status</Label>
              <RadioGroup name="completion_status">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <RadioGroupItem value="Completed fully" id="completed_fully" />
                    <Label htmlFor="completed_fully" className="ml-2">Completed fully</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="Completed partially" id="completed_partially" />
                    <Label htmlFor="completed_partially" className="ml-2">Completed partially</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="Still in progress" id="still_progress" />
                    <Label htmlFor="still_progress" className="ml-2">Still in progress</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="Abandoned" id="abandoned" />
                    <Label htmlFor="abandoned" className="ml-2">Abandoned</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </>
        )}

        {/* Issues/Challenges (optional) */}
        <div>
          <Label className="text-base font-medium">
            {category === 'products_devices' ? 'Any issues? (optional)' : 'Any challenges? (optional)'}
          </Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md">
              {issueOptions.map((issue) => (
                <div key={issue} className="flex items-center space-x-2">
                  <Checkbox
                    id={issue}
                    checked={selectedIssues.includes(issue)}
                    onCheckedChange={() => handleIssueToggle(issue)}
                  />
                  <Label htmlFor={issue} className="text-sm font-normal cursor-pointer">
                    {issue}
                  </Label>
                </div>
              ))}
            </div>
          )}
          <input 
            type="hidden" 
            name="issues_experienced" 
            value={selectedIssues.length > 0 ? JSON.stringify(selectedIssues) : ''} 
          />
        </div>
      </div>
    </>
  );
}
