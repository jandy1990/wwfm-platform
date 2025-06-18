import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SolutionCategory, COST_RANGES } from '@/lib/form-templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/ui/skeleton';

interface DosageFormProps {
  category: Extract<SolutionCategory, 'supplements_vitamins' | 'medications' | 'natural_remedies' | 'beauty_skincare'>;
}

export function DosageForm({ category }: DosageFormProps) {
  const [costType, setCostType] = useState<'monthly' | 'one_time'>('monthly');
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['None']);
  const [sideEffectOptions, setSideEffectOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  // Fetch side effect options from database
  useEffect(() => {
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
  }, [category, supabase]);
  
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

  return (
    <>
      {/* Cost field */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Cost? <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={costType} onValueChange={(value) => setCostType(value as 'monthly' | 'one_time')}>
          <div className="flex gap-4">
            <div className="flex items-center">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly" className="ml-2">Monthly cost</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem value="one_time" id="one_time" />
              <Label htmlFor="one_time" className="ml-2">One-time purchase</Label>
            </div>
          </div>
        </RadioGroup>
        
        <Select name="cost_range" required>
          <SelectTrigger>
            <SelectValue placeholder="Select cost range" />
          </SelectTrigger>
          <SelectContent>
            {COST_RANGES[costType === 'monthly' ? 'monthly' : 'one_time'].map(range => (
              <SelectItem key={range} value={range}>{range}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="cost_type" value={costType} />
      </div>

      {/* Side Effects */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Side Effects <span className="text-red-500">*</span>
        </Label>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
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

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="dosage_amount">Dosage amount</Label>
          <Input 
            id="dosage_amount"
            name="dosage_amount" 
            placeholder="e.g., 400mg, 2 tablets, 5000 IU"
          />
        </div>

        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select name="frequency">
            <SelectTrigger>
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Once daily">Once daily</SelectItem>
              <SelectItem value="Twice daily">Twice daily</SelectItem>
              <SelectItem value="Three times daily">Three times daily</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Other">Other (please describe)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="form">Form</Label>
          <Select name="form">
            <SelectTrigger>
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tablet/Pill">Tablet/Pill</SelectItem>
              <SelectItem value="Capsule">Capsule</SelectItem>
              <SelectItem value="Liquid">Liquid</SelectItem>
              <SelectItem value="Powder">Powder</SelectItem>
              <SelectItem value="Gummy">Gummy</SelectItem>
              <SelectItem value="Sublingual">Sublingual</SelectItem>
              <SelectItem value="Topical/Cream">Topical/Cream</SelectItem>
              <SelectItem value="Gel">Gel</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="time_of_day">Time of day</Label>
          <Select name="time_of_day">
            <SelectTrigger>
              <SelectValue placeholder="When do you take it?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Morning (7-10am)">Morning (7-10am)</SelectItem>
              <SelectItem value="Afternoon (2-5pm)">Afternoon (2-5pm)</SelectItem>
              <SelectItem value="Evening/Night (8pm+)">Evening/Night (8pm+)</SelectItem>
              <SelectItem value="With meals">With meals</SelectItem>
              <SelectItem value="Empty stomach">Empty stomach</SelectItem>
              <SelectItem value="Doesn't matter">Doesn't matter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {category !== 'beauty_skincare' && (
          <div>
            <Label htmlFor="brand_manufacturer">Brand/Manufacturer</Label>
            <Input 
              id="brand_manufacturer"
              name="brand_manufacturer" 
              placeholder="Optional"
            />
          </div>
        )}

        {category === 'beauty_skincare' && (
          <div>
            <Label htmlFor="product_type">Product Type</Label>
            <Select name="product_type">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Moisturizer">Moisturizer</SelectItem>
                <SelectItem value="Serum">Serum</SelectItem>
                <SelectItem value="Cleanser">Cleanser</SelectItem>
                <SelectItem value="Toner">Toner</SelectItem>
                <SelectItem value="Treatment">Treatment</SelectItem>
                <SelectItem value="Mask">Mask</SelectItem>
                <SelectItem value="Exfoliant">Exfoliant</SelectItem>
                <SelectItem value="Oil">Oil</SelectItem>
                <SelectItem value="Sunscreen">Sunscreen</SelectItem>
                <SelectItem value="Eye cream">Eye cream</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
}
