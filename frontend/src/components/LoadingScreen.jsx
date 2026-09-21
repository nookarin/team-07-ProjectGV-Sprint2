import { OrbitRing } from "./orbit-ring";

// Full-screen loading overlay with a black background, shown by AuthProvider
// while auth state is being resolved (initial check or login in progress).
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black">
      {/* OrbitRing spinner imported from the shadcn @loading-ui/orbit-ring component */}
      <OrbitRing className="size-12 text-violet-400" />
      <p className="text-sm font-semibold tracking-wide text-white">
        Loading...
      </p>
    </div>
  );
}