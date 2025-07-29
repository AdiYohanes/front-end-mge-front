# Dark Mode Implementation Guide

## Overview

Project ini telah diimplementasikan dengan dukungan dark mode yang sederhana dan mudah digunakan dengan toggle button.

## Fitur yang Diimplementasikan

### 1. Simple Theme Toggle

- **UI**: Toggle button di navbar (kanan atas)
- **Options**: Light mode ↔ Dark mode
- **Icons**: Sun (light), Moon (dark)
- **Persistence**: Menyimpan pilihan di localStorage

### 2. Theme Toggle UI

- **Location**: Di navbar (kanan atas)
- **Type**: Simple toggle button
- **Icons**: Sun (light), Moon (dark)
- **Accessibility**: Proper ARIA labels dan title

### 3. CSS Variables

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
  --shadow-color: rgba(0, 0, 0, 0.3);
}
```

### 4. Theme-Aware Classes

- `.bg-theme-primary` - Background utama
- `.bg-theme-secondary` - Background sekunder
- `.bg-theme-tertiary` - Background tersier
- `.text-theme-primary` - Text utama
- `.text-theme-secondary` - Text sekunder
- `.text-theme-muted` - Text muted
- `.border-theme` - Border color
- `.shadow-theme` - Shadow color

## Komponen yang Diupdate

### 1. ThemeProvider

- **File**: `src/components/common/ThemeProvider.jsx`
- **Fungsi**: Mengelola state theme dan menyediakan context
- **Simplified**: Hanya light/dark toggle

### 2. ThemeToggle

- **File**: `src/components/common/ThemeToggle.jsx`
- **Fungsi**: Simple toggle button untuk switching theme
- **UI**: Button dengan icon sun/moon

### 3. Navbar

- **Update**: Menambahkan ThemeToggle component
- **Location**: Kanan atas navbar

### 4. Footer

- **Update**: Menggunakan theme-aware colors
- **Classes**: `bg-theme-primary`, `text-theme-secondary`

### 5. Calendar

- **Update**: CSS variables untuk responsive colors
- **File**: `src/styles/Calendar.css`

### 6. Pages & Components

- **FaqPage**: Theme-aware colors
- **GamesPage**: Theme-aware colors
- **TaglineSection**: Theme-aware colors
- **ConsolesSection**: Theme-aware colors
- **RoomsSection**: Theme-aware colors

## Cara Penggunaan

### 1. Menggunakan Theme Classes

```jsx
// Sebelum
<div className="bg-white text-gray-800">

// Sesudah
<div className="bg-theme-primary text-theme-primary">
```

### 2. Menggunakan Theme Hook

```jsx
import { useTheme } from "./components/common/ThemeProvider";

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
};
```

### 3. Menambahkan Theme Toggle

```jsx
import ThemeToggle from "./components/common/ThemeToggle";

// Di navbar atau component lain
<ThemeToggle />;
```

## User Experience

### Simple Toggle

- **One Click**: Toggle antara light dan dark mode
- **Visual Feedback**: Icon berubah sesuai theme
- **Persistence**: Theme tersimpan dan tidak hilang saat refresh
- **Smooth Transition**: Animasi smooth saat switching

### Accessibility

- **ARIA Labels**: Proper accessibility labels
- **Keyboard Navigation**: Support untuk keyboard
- **High Contrast**: Kontras yang baik di kedua theme

## Browser Compatibility

### Supported Browsers

- Chrome/Edge (Chromium-based)
- Firefox
- Safari
- Mobile browsers

### Features

- ✅ Simple light/dark toggle
- ✅ localStorage persistence
- ✅ Smooth transitions
- ✅ Accessible UI
- ✅ Responsive design

## Testing

### Manual Testing

1. **Light Mode**: Klik toggle untuk switch ke light mode
2. **Dark Mode**: Klik toggle untuk switch ke dark mode
3. **Persistence**: Refresh page - theme harus tetap sama
4. **Visual Check**: Pastikan semua komponen terlihat baik di kedua theme

### Automated Testing

```bash
# Run development server
npm run dev

# Test theme switching
# 1. Click theme toggle in navbar
# 2. Verify colors change appropriately
# 3. Refresh page - theme should persist
# 4. Check all components in both themes
```

## Best Practices

### 1. Always Use Theme Classes

```jsx
// ✅ Good
<div className="bg-theme-primary text-theme-primary">

// ❌ Bad
<div className="bg-white text-black">
```

### 2. Test Both Themes

- Pastikan semua komponen terlihat baik di light dan dark mode
- Periksa kontras dan keterbacaan
- Test interaksi dan hover states

### 3. Smooth Transitions

- Semua elemen memiliki `transition` untuk smooth theme switching
- Gunakan CSS variables untuk konsistensi

### 4. Accessibility

- Theme toggle memiliki proper ARIA labels
- High contrast ratios di kedua theme
- Keyboard navigation support

## Troubleshooting

### Theme Tidak Berubah

1. Periksa apakah ThemeProvider sudah di-wrap di main.jsx
2. Pastikan localStorage tidak di-block
3. Check browser console untuk errors

### Colors Tidak Responsive

1. Pastikan menggunakan theme classes (`.bg-theme-primary`, dll)
2. Periksa CSS variables sudah didefinisikan
3. Verify `data-theme` attribute di HTML

### Performance Issues

1. Gunakan CSS variables untuk colors
2. Hindari inline styles untuk theme-dependent properties
3. Optimize re-renders dengan proper state management

## Simple vs Complex Implementation

### Why Simple Toggle?

- **Better UX**: User tidak perlu memilih dari dropdown
- **Faster**: One-click switching
- **Intuitive**: Icon yang jelas (sun/moon)
- **Mobile Friendly**: Lebih mudah di mobile
- **Less Code**: Implementasi lebih sederhana
