import { UnlimitedSetup } from "@/components/billing/unlimited-setup";

export default function UnlimitedSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <UnlimitedSetup />
      </div>
    </div>
  );
}