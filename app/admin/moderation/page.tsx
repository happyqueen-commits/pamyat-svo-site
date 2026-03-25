import { redirect } from 'next/navigation';

export default function LegacyModerationRedirect() {
  redirect('/cabinet/moderation');
}
