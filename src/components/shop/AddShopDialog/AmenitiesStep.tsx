import { Check, Plus, Sparkles, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { POPULAR_CATEGORIES } from './constants';
import type { Amenity, PredefinedCategoryConfig } from './types';

interface AmenitiesStepProps {
  amenities: Amenity[];
  togglePredefinedCategory: (cat: PredefinedCategoryConfig) => void;
  handleUpdateAmenityDescription: (id: string, description: string) => void;
  handleRemoveAmenity: (id: string) => void;
  customAmenityName: string;
  setCustomAmenityName: (val: string) => void;
  customAmenityDesc: string;
  setCustomAmenityDesc: (val: string) => void;
  handleAddCustomAmenity: () => void;
}

export function AmenitiesStep({
  amenities,
  togglePredefinedCategory,
  handleUpdateAmenityDescription,
  handleRemoveAmenity,
  customAmenityName,
  setCustomAmenityName,
  customAmenityDesc,
  setCustomAmenityDesc,
  handleAddCustomAmenity
}: AmenitiesStepProps) {
  return (
    <div className='space-y-3.5'>
      <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
        <Tag size={14} className='text-amber-gold' />
        <span>3. Thể loại &amp; Tiện ích</span>
      </h3>

      {/* Category Chips */}
      <div className='space-y-3'>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-foreground'>
            Đặc điểm &amp; Tiện ích nổi bật
          </Label>
          <div className='flex flex-wrap gap-2'>
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = amenities.some((a) => a.id === cat.id);
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => togglePredefinedCategory(cat)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-150 cursor-pointer select-none',
                    isSelected
                      ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-xs'
                      : 'bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {isSelected ? (
                    <Check size={12} className='stroke-[3] flex-shrink-0' />
                  ) : (
                    <CatIcon size={12} className='flex-shrink-0 text-muted-foreground' />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Amenities List with Editable Descriptions */}
        {amenities.length > 0 && (
          <div className='space-y-2 pt-1'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                <Check size={13} className='text-teal stroke-[2.5]' />
                <span>Tiện ích đã chọn ({amenities.length})</span>
              </Label>
              <span className='text-[10px] text-muted-foreground'>
                Nhấp vào ô mô tả để chỉnh sửa theo ý bạn
              </span>
            </div>

            <div className='space-y-2'>
              {amenities.map((amenity) => {
                const predefinedCat = POPULAR_CATEGORIES.find((p) => p.id === amenity.id);
                const Icon = predefinedCat?.icon || (amenity.type === 'custom' ? Sparkles : Tag);
                return (
                  <div
                    key={amenity.id}
                    className='p-3 bg-secondary/35 rounded-2xl border border-border/80 space-y-2 shadow-2xs'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <div className='w-6 h-6 rounded-lg bg-amber-gold/15 text-amber-gold flex items-center justify-center flex-shrink-0'>
                          <Icon size={13} />
                        </div>
                        <span className='text-xs font-bold text-foreground truncate'>
                          {amenity.name}
                        </span>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-[9px] px-1.5 py-0',
                            amenity.type === 'custom'
                              ? 'bg-amber-gold/10 text-amber-gold border-amber-gold/30'
                              : 'bg-secondary text-muted-foreground border-border'
                          )}
                        >
                          {amenity.type === 'custom' ? 'Tự định nghĩa' : 'Có sẵn'}
                        </Badge>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleRemoveAmenity(amenity.id)}
                        className='p-1 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground rounded-lg transition-colors cursor-pointer shrink-0'
                        title='Xóa tiện ích này'
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className='flex items-start gap-2 pt-0.5'>
                      <span className='text-[11px] text-muted-foreground font-medium shrink-0 pt-1'>
                        Mô tả:
                      </span>
                      <textarea
                        value={amenity.description}
                        onChange={(e) =>
                          handleUpdateAmenityDescription(amenity.id, e.target.value)
                        }
                        placeholder='Nhập hoặc chỉnh sửa mô tả cho tiện ích này...'
                        rows={2}
                        className='w-full text-xs bg-background border border-border/80 focus:border-amber-gold focus:ring-1 focus:ring-amber-gold rounded-xl px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 resize-y min-h-[38px] transition-all'
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Amenities with Descriptions */}
        <div className='p-3 bg-secondary/25 rounded-2xl border border-border/80 space-y-2.5 mt-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
              <Sparkles size={13} className='text-amber-gold' />
              <span>Thêm tiện ích tự định nghĩa</span>
            </Label>
            <span className='text-[10px] text-muted-foreground'>Viết tên &amp; mô tả riêng</span>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Input
                value={customAmenityName}
                onChange={(e) => setCustomAmenityName(e.target.value)}
                placeholder='Tên tiện ích (VD: Phòng họp riêng, Đỗ xe ô tô, Ghế công thái học...)'
                className='h-8 text-xs bg-background border-border rounded-xl flex-1'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddCustomAmenity}
                disabled={!customAmenityName.trim()}
                className='h-8 px-3 text-xs rounded-xl flex-shrink-0 cursor-pointer font-medium'
              >
                <Plus size={13} className='mr-1' />
                <span>Thêm</span>
              </Button>
            </div>
            <Input
              value={customAmenityDesc}
              onChange={(e) => setCustomAmenityDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomAmenity();
                }
              }}
              placeholder='Mô tả ngắn (VD: 5 phòng họp cách âm, trang bị máy chiếu...)'
              className='h-8 text-xs bg-background border-border rounded-xl'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
