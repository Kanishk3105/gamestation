export function getIncludes(name: string): string[] {
  const items = ['PS5 Ultra HD Console', 'Power & HDMI Cables'];
  const lower = name.toLowerCase();
  if (lower.includes('2 controller') || lower.includes('2 controllers')) {
    items.push('2x DualSense Wireless Controllers');
  } else if (lower.includes('4 controller') || lower.includes('4 controllers')) {
    items.push('4x DualSense Wireless Controllers');
  } else if (lower.includes('1 controller')) {
    items.push('1x DualSense Wireless Controller');
  }
  if (lower.includes('100+') || lower.includes('games')) {
    items.push('100+ Games Library Included');
  }
  if (lower.includes('ea play')) {
    items.push('EA Play Subscription');
  }
  if (lower.includes('racing wheel')) {
    items.push('Force Feedback Racing Wheel & Pedals');
  }
  if (lower.includes('portal')) {
    return ['PlayStation Portal Handheld', 'USB-C Charging Cable', 'Screen Protector'];
  }
  return items;
}
