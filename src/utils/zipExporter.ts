import JSZip from 'jszip';
import { ClonedProject } from '../types/cloner';

export async function exportProjectToZip(project: ClonedProject): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `${project.domain.replace(/[^a-z0-9]/gi, '_')}-replica`;
  const root = zip.folder(folderName) || zip;

  // Root configuration files
  root.file('package.json', project.packageJsonCode);
  root.file('tailwind.config.js', project.tailwindConfigCode);
  root.file('README.md', project.readmeCode);
  root.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // PWA & Mobile Web Manifest
  const publicFolder = root.folder('public');
  if (publicFolder) {
    publicFolder.file(
      'manifest.json',
      JSON.stringify(
        {
          name: `${project.brandName} Mobile App`,
          short_name: project.brandName,
          description: project.tagline,
          start_url: '/',
          display: 'standalone',
          background_color: '#0f172a',
          theme_color: project.colorPalette[0] || '#6366f1',
          orientation: 'portrait',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        null,
        2
      )
    );
  }

  // Capacitor Config for mobile APK / iOS build
  if (project.capacitorConfigCode) {
    root.file('capacitor.config.json', project.capacitorConfigCode);
  }

  // Components folder
  const componentsFolder = root.folder('components');
  if (componentsFolder) {
    componentsFolder.file('Navbar.tsx', project.globalNavbarCode);
    componentsFolder.file('Footer.tsx', project.globalFooterCode);

    // Mobile Bottom Tab Bar
    componentsFolder.file(
      'MobileBottomNav.tsx',
      `'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', ar: 'الرئيسية', path: '/', icon: Home },
    { name: 'Explore', ar: 'استكشاف', path: '/features', icon: Compass },
    { name: 'Pricing', ar: 'الأسعار', path: '/pricing', icon: ShoppingBag },
    { name: 'Profile', ar: 'حسابي', path: '/contact', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={\`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium transition \${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }\`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}`
    );
  }

  // App router folder
  const appFolder = root.folder('app');
  if (appFolder) {
    // Shared Layout with mobile responsiveness and PWA manifest
    appFolder.file(
      'layout.tsx',
      `import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const metadata = {
  title: '${project.brandName} - Mobile & Web App',
  description: '${project.tagline}',
  manifest: '/manifest.json',
  themeColor: '${project.colorPalette[0] || '#6366f1'}',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="${project.region === 'kuwait' ? 'ar' : 'en'}" dir="${project.isRtlSupported ? 'rtl' : 'ltr'}">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans pb-16 sm:pb-0 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}`
    );

    appFolder.file(
      'globals.css',
      `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${project.colorPalette[0] || '#6366f1'};
  --secondary: ${project.colorPalette[1] || '#0f172a'};
  --accent: ${project.colorPalette[2] || '#10b981'};
}

/* Safe area insets for iOS & Android notch */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}
`
    );

    // Routes
    for (const route of project.routes) {
      if (route.path === '/' || route.path === '') {
        appFolder.file('page.tsx', route.reactCode);
      } else {
        const cleanSubRoute = route.path.replace(/^\//, '').replace(/\/$/, '');
        const routeFolder = appFolder.folder(cleanSubRoute);
        if (routeFolder) {
          routeFolder.file('page.tsx', route.reactCode);
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Exports a standalone React Native (Expo) Mobile App Project
 */
export async function exportMobileProjectToZip(project: ClonedProject): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `${project.domain.replace(/[^a-z0-9]/gi, '_')}-react-native-expo`;
  const root = zip.folder(folderName) || zip;

  const appSlug = project.domain.replace(/[^a-z0-9]/gi, '').toLowerCase();

  // 1. package.json for Expo
  root.file(
    'package.json',
    JSON.stringify(
      {
        name: appSlug,
        version: '1.0.0',
        scripts: {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web',
        },
        dependencies: {
          expo: '~51.0.0',
          'expo-status-bar': '~1.12.1',
          react: '18.2.0',
          'react-native': '0.74.1',
          'react-native-safe-area-context': '4.10.1',
          'react-native-screens': '~3.31.1',
          '@react-navigation/native': '^6.1.17',
          '@react-navigation/bottom-tabs': '^6.5.20',
          'lucide-react-native': '^0.378.0',
        },
        devDependencies: {
          '@babel/core': '^7.24.0',
          '@types/react': '~18.2.79',
          typescript: '~5.3.3',
        },
        private: true,
      },
      null,
      2
    )
  );

  // 2. app.json
  root.file(
    'app.json',
    project.expoConfigCode ||
      JSON.stringify(
        {
          expo: {
            name: `${project.brandName} Mobile`,
            slug: appSlug,
            version: '1.0.0',
            orientation: 'portrait',
            icon: './assets/icon.png',
            userInterfaceStyle: 'dark',
            splash: {
              image: './assets/splash.png',
              resizeMode: 'contain',
              backgroundColor: '#0f172a',
            },
            ios: {
              supportsTablet: true,
              bundleIdentifier: `com.sheikhfarid.${appSlug}`,
            },
            android: {
              adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#0f172a',
              },
              package: `com.sheikhfarid.${appSlug}`,
            },
          },
        },
        null,
        2
      )
  );

  // 3. React Native App.tsx
  root.file('App.tsx', project.reactNativeCode || generateFallbackReactNativeApp(project));

  // 4. README with build instructions (APK & IPA)
  root.file(
    'README.md',
    `# ${project.brandName} Mobile App (React Native & Expo)

Autonomous Mobile App cloned and generated for **${project.brandName}**.
Target Region: ${project.region === 'kuwait' ? 'Kuwait (KWD Currency & RTL Support)' : 'Global'}

## 🚀 How to Run Locally

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the Expo development server:
   \`\`\`bash
   npx expo start
   \`\`\`

3. Press \`a\` to run on Android Emulator or scan QR code with Expo Go on your mobile phone!

## 📦 How to Build Native Android APK

1. Install EAS CLI:
   \`\`\`bash
   npm install -g eas-cli
   eas login
   \`\`\`

2. Configure build:
   \`\`\`bash
   eas build:configure
   \`\`\`

3. Generate standalone Android APK:
   \`\`\`bash
   eas build -p android --profile preview
   \`\`\`

## 🛠️ Kuwait Features Included:
- Kuwait Dinar (KWD / د.ك) pricing & payment mock
- Bilingual English / Arabic support
- Mobile Native Tab Bar Navigation
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

function generateFallbackReactNativeApp(project: ClonedProject): string {
  const isKuwait = project.region === 'kuwait';
  const currency = isKuwait ? 'KWD' : '$';

  return `import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [cartCount, setCartCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Mobile Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>${project.brandName}</Text>
          <Text style={styles.brandSubtitle}>
            ${isKuwait ? 'الكويت • Kuwait Official Mobile App' : project.tagline}
          </Text>
        </View>
        <TouchableOpacity style={styles.cartBadge} onPress={() => setCartCount(cartCount + 1)}>
          <Text style={styles.cartBadgeText}>🛒 {cartCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mobile Hero Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>
            ${isKuwait ? '🇰🇼 Kuwait Fast Delivery & KNet Ready' : '✨ 100% Native Mobile App'}
          </Text>
          <Text style={styles.heroTitle}>Welcome to ${project.brandName}</Text>
          <Text style={styles.heroDescription}>
            ${project.summary || 'Instant orders, top security and seamless experience.'}
          </Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => setCartCount(cartCount + 1)}>
            <Text style={styles.heroButtonText}>
              ${isKuwait ? 'اطلب الآن • Order Now' : 'Explore Featured'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Items / Services */}
        <Text style={styles.sectionTitle}>
          ${isKuwait ? 'الخدمات المميزة • Featured Services' : 'Available Features'}
        </Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>⚡</Text>
            <Text style={styles.cardTitle}>Express Delivery</Text>
            <Text style={styles.cardPrice}>2.500 ${currency}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardTitle}>Secure Checkout</Text>
            <Text style={styles.cardPrice}>KNet / Apple Pay</Text>
          </View>
        </View>
      </ScrollView>

      {/* Mobile Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        {['Home', 'Search', 'Orders', 'Profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.navItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>
              {tab === 'Home' ? '🏠' : tab === 'Search' ? '🔍' : tab === 'Orders' ? '🛍️' : '👤'}
            </Text>
            <Text style={[styles.navLabel, activeTab === tab && styles.navLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  cartBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroBadge: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardPrice: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 18,
    color: '#64748b',
  },
  navTextActive: {
    color: '#818cf8',
  },
  navLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#818cf8',
    fontWeight: 'bold',
  },
});
`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
