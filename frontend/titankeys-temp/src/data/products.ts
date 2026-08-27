import { Product } from '../types';

export const titanKeysElite: Product = {
  id: 'titankeys-elite',
  name: 'TitanKeys Elite',
  tagline: 'Custom CNC Aluminum Wireless Mechanical Keyboard',
  price: 399,
  originalPrice: 479,
  discountPercentage: 20,
  tags: ['KEYBOARD', 'BLUETOOTH', 'WIRELESS'],
  description:
    'Built with a solid aluminum frame, durable PBT double-shot keycaps, and multi-device Bluetooth connectivity to conquer both gaming and work.',
  colors: [
    {
      id: 'black',
      name: 'Black',
      hex: '#111319',
      borderClass: 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]',
      // High-res cyberpunk gaming desk image matching the user screenshot
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
      deskImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
    },
    {
      id: 'white',
      name: 'Cyber White',
      hex: '#ffffff',
      borderClass: 'border-white/70 shadow-[0_0_10px_rgba(255,255,255,0.4)]',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=85',
      deskImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=85',
    },
    {
      id: 'lilac',
      name: 'Nebula Lilac',
      hex: '#d8b4fe',
      borderClass: 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=85',
      deskImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=85',
    },
    {
      id: 'pink',
      name: 'Cyber Pink',
      hex: '#f43f5e',
      borderClass: 'border-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]',
      image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=1200&q=85',
      deskImage: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=1200&q=85',
    },
  ],
  switches: [
    {
      id: 'linear-red',
      name: 'Titan Linear Red (45g)',
      type: 'linear',
      color: '#ef4444',
      actuationForce: '45g ± 5g',
      soundType: 'thock',
      description: 'Ultra-smooth keystroke with deep thock sound profile. Ideal for fast-paced gaming.',
    },
    {
      id: 'tactile-brown',
      name: 'Titan Tactile Brown (55g)',
      type: 'tactile',
      color: '#b45309',
      actuationForce: '55g ± 5g',
      soundType: 'clack',
      description: 'Tactile bump feedback without loud noise. Perfect balance for coding and typing.',
    },
    {
      id: 'clicky-blue',
      name: 'Titan Clicky Blue (60g)',
      type: 'clicky',
      color: '#06b6d4',
      actuationForce: '60g ± 5g',
      soundType: 'click',
      description: 'Satisfying mechanical acoustic click on every key press.',
    },
  ],
  specs: [
    { label: 'Form Factor', value: '75% Compact (84 Keys) with CNC Aluminum Knob' },
    { label: 'Case Material', value: '6063 Anodized CNC Machined Aluminum' },
    { label: 'Mounting Style', value: 'Double Gasket Mount + Poron Foam Layering' },
    { label: 'Keycaps', value: 'Durable Cherry Profile PBT Double-Shot' },
    { label: 'Connectivity', value: 'Tri-Mode: 2.4GHz Wireless, Bluetooth 5.2 (3 Devices), USB-C' },
    { label: 'Battery Capacity', value: '4000mAh Rechargeable Li-ion (Up to 240 hrs RGB off)' },
    { label: 'Polling Rate', value: '1000Hz (2.4G & Wired) / 125Hz (Bluetooth)' },
    { label: 'RGB Backlight', value: 'South-facing RGB Per-Key LEDs with 22 Animation Modes' },
    { label: 'Compatibility', value: 'Windows, macOS, Linux, iOS, Android (VIA Programmable)' },
  ],
  features: [
    {
      title: 'Precision CNC Machined Chassis',
      description: 'Carved from aerospace-grade 6063 aluminum block with fine sandblasted matte finish.',
      icon: 'Shield',
    },
    {
      title: 'Tri-Mode Wireless Multi-Pairing',
      description: 'Seamlessly switch across your PC, MacBook, and iPad with one click (BT 5.2 + 2.4G low latency).',
      icon: 'Wifi',
    },
    {
      title: 'Hot-Swappable 5-Pin PCB',
      description: 'Easily swap mechanical switches without soldering. Compatible with Cherry, Gateron, Kailh.',
      icon: 'Layers',
    },
    {
      title: 'Acoustic Sound Dampening Foam',
      description: 'Custom Poron switch pad, IXPE sound dampener, and silicone base gasket create the signature marble thock sound.',
      icon: 'Volume2',
    },
  ],
  inTheBox: [
    '1x TitanKeys Elite Assembled Keyboard',
    '1x 2.4GHz Wireless Nano Receiver',
    '1x Braided USB-C to USB-A Custom Cable (1.8m)',
    '1x 2-in-1 Aluminum Keycap & Switch Puller',
    '4x Extra Accent Keycaps (Novelty Gears)',
    '3x Sample Titan Switches',
    '1x Hex Screwdriver & Quick Start Guide',
  ],
  reviews: [
    {
      id: 'rev-1',
      author: 'Marcus "Viper" Vance',
      rating: 5,
      date: 'August 18, 2026',
      comment:
        'The build quality is out of this world! Heavy aluminum weight prevents any desk sliding, and the factory lubed linear switches produce that glorious creamy thock right out of the box.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Elena Rostova',
      rating: 5,
      date: 'August 12, 2026',
      comment:
        'Bluetooth latency is unnoticeable when switching between my work Mac and gaming rig. The South-facing RGB lighting through the PBT keycaps looks stunning with neon theme setups.',
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'David K. (Software Architect)',
      rating: 5,
      date: 'August 5, 2026',
      comment:
        'Easily the best pre-built custom keyboard under $500. VIA web configurator works flawlessly for remapping key layers and macros.',
      verified: true,
    },
  ],
};
