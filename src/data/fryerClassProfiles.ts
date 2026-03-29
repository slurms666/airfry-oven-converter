import type { FryerClassProfile } from '../types';

export const fryerClassProfiles: FryerClassProfile[] = [
  {
    id: 'drawer_compact_low',
    label: 'Small compact drawer',
    blurb: 'Smaller baskets that crowd quickly and usually cook a touch slower.',
    example: 'Often 3-4 litre single drawers',
    timeMultiplier: 1.1,
    confidenceAdjustment: 0,
    loadAdjustments: {
      some_overlap: 0.05,
      crowded: 0.05,
    },
  },
  {
    id: 'drawer_standard',
    label: 'Standard drawer',
    blurb: 'The baseline single-drawer air fryer for most everyday pack instructions.',
    example: 'Common 4-6 litre drawer models',
    timeMultiplier: 1,
    confidenceAdjustment: 0,
    loadAdjustments: {},
  },
  {
    id: 'drawer_dual_high',
    label: 'Large dual drawer / high power',
    blurb: 'Bigger, faster drawer-style units that handle batches a bit better.',
    example: 'Larger dual-drawer or high-wattage drawers',
    timeMultiplier: 0.92,
    confidenceAdjustment: 0,
    loadAdjustments: {
      some_overlap: -0.03,
      crowded: -0.05,
    },
  },
  {
    id: 'oven_or_combi_large',
    label: 'Oven-style / combi',
    blurb: 'Tray-style or combi machines that can behave differently from basket fryers.',
    example: 'Countertop oven-style and combi air fryers',
    timeMultiplier: 0.98,
    confidenceAdjustment: -15,
    loadAdjustments: {
      some_overlap: 0.02,
      crowded: 0.03,
    },
  },
];

export const fryerClassProfileMap = Object.fromEntries(
  fryerClassProfiles.map((profile) => [profile.id, profile]),
) as Record<FryerClassProfile['id'], FryerClassProfile>;
