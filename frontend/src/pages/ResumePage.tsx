import { Show } from 'solid-js';
import { createResource } from 'solid-js';
import ResumeDisplay from '../components/ResumeDisplay.tsx';
import { getResume } from '../lib/api.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { A } from '@solidjs/router';
import type { ResumeData } from '../lib/types.ts';
import { onMount } from 'solid-js';

export default function ResumePage() {
  const [resume] = createResource<ResumeData>(getResume);
  onMount(() => {
    document.title = 'Cameron Fournier - Hire Me!';
  });

  return (
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <A href="/" class="text-blue-600 hover:underline mb-6 inline-block print:hidden">
        ← Back to home
      </A>
      <Show
        when={resume()}
        fallback={
          <div class="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        }
      >
        {(data) => <ResumeDisplay {...data()} />}
      </Show>
    </div>
  );
}
