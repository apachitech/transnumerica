const fs = require('fs');

let content = fs.readFileSync('src/app/driver/DriverPageClient.tsx', 'utf8');

// 1. Add import for ShuttleDashboardTab
if (!content.includes('ShuttleDashboardTab')) {
  content = content.replace(
    "import { DriverAuthModal } from '@/components/driver/DriverAuthModal';",
    "import { DriverAuthModal } from '@/components/driver/DriverAuthModal';\nimport { ShuttleDashboardTab } from '@/components/driver/ShuttleDashboardTab';\nimport { Bus } from 'lucide-react';"
  );
}

// 2. Update DriverTab type
content = content.replace(
  "type DriverTab = 'COCKPIT' | 'KYC' | 'VEHICLE' | 'EARNINGS';",
  "type DriverTab = 'COCKPIT' | 'KYC' | 'VEHICLE' | 'SHUTTLE' | 'EARNINGS';"
);

// 3. Add SHUTTLE mode switch in handleSwitchVehicleType
const oldSwitch = `      setIncomingRequests(CAR_REQUESTS);
      showToast('🚗 Basculement en mode VOITURE TAXI : courses 4 roues et confort activés.');
    }
  };`;

const newSwitch = `      setIncomingRequests(CAR_REQUESTS);
      showToast('🚗 Basculement en mode VOITURE TAXI : courses 4 roues et confort activés.');
    } else if (type === 'BUS') {
      setDriver((prev) => ({
        ...prev,
        vehicleType: 'BUS',
        vehicleModel: 'Marcopolo Viaggio 1050',
        vehiclePlate: 'KN 7712 BG',
        vehicleColor: 'Blanc & Bleu',
        hasPassengerHelmet: false,
      }));
      setActiveTab('SHUTTLE');
      showToast('🚌 Basculement en mode NAVETTE / BUS INTERURBAIN : gestion de flotte et billets QR.');
    }
  };`;

content = content.replace(oldSwitch, newSwitch);

// 4. Update nav buttons to include Navette Bus
const oldNav = `<nav
          aria-label="Navigation du tableau de bord chauffeur"
          className="bg-white dark:bg-neutral-850 p-1.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-750 shadow-sm grid grid-cols-4 gap-1 select-none sticky top-2 z-30"
        >`;

const newNav = `<nav
          aria-label="Navigation du tableau de bord chauffeur"
          className="bg-white dark:bg-neutral-850 p-1.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-750 shadow-sm grid grid-cols-5 gap-1 select-none sticky top-2 z-30"
        >`;

content = content.replace(oldNav, newNav);

// 5. Insert Navette Tab button before EARNINGS
const earningsTabButton = `{/* Tab 4: Earnings & Payout */}`;
const shuttleTabButton = `{/* Tab 4: Navette / Bus Interurbain */}
          <button
            type="button"
            onClick={() => setActiveTab('SHUTTLE')}
            className={\`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all \${
              activeTab === 'SHUTTLE'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }\`}
          >
            <Bus className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs">Navette</span>
          </button>

          {/* Tab 5: Earnings & Payout */}`;

content = content.replace(earningsTabButton, shuttleTabButton);

// 6. Insert ShuttleDashboardTab content before EARNINGS tab content
const earningsContent = `{/* ---------------- TAB 4: EARNINGS & PAYOUT ---------------- */}`;
const shuttleContent = `{/* ---------------- TAB 4: NAVETTE / SHUTTLE ---------------- */}
        {activeTab === 'SHUTTLE' && (
          <ShuttleDashboardTab
            onOpenManifest={(tripId) => router.push(\`/driver/manifest/\${tripId}\`)}
            onOpenCheckin={() => router.push('/driver/checkin')}
          />
        )}

        {/* ---------------- TAB 5: EARNINGS & PAYOUT ---------------- */}`;

content = content.replace(earningsContent, shuttleContent);

fs.writeFileSync('src/app/driver/DriverPageClient.tsx', content, 'utf8');
console.log('DriverPageClient updated with Shuttle Tab');

