import { ReferralSongProvider } from "@/components/ui/ReferralSongContext"

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ReferralSongProvider>{children}</ReferralSongProvider>
}
