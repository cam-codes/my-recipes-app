import { For } from 'solid-js';
import type { ResumeData } from '../lib/types';

export default function ResumeDisplay(props: ResumeData) {
  return (
    <div class="max-w-4xl mx-auto bg-white dark:bg-slate-900 print:bg-white text-gray-900 dark:text-gray-100 print:text-gray-900 shadow-lg rounded-lg p-8 print:shadow-none print:p-0">
      {/* Hidden page disclaimer */}
      <div class="mb-10 p-6 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 rounded-lg text-center print:hidden">
        <p class="text-lg font-medium text-amber-900 dark:text-amber-200">
          You've reached a hidden page! 🔍
        </p>

        <p class="mt-2 text-gray-700 dark:text-gray-200 print:text-gray-700">
          There are no links to this resume from the main recipe site (it's mostly for family). If
          you're here, you are probably doing some detective work for an interview — nice!
        </p>
      </div>

      {/* PDF Download Button (hidden on print) */}
      <div class="mb-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          class="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition shadow-md"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download resume as PDF
        </button>
      </div>

      {/* Header */}
      <header class="text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100 print:text-gray-900">
          {props.name}
        </h1>
        <div class="mt-3 text-lg">
          <a
            href={`mailto:${props.email}`}
            class="text-blue-600 dark:text-blue-400 print:text-blue-700 hover:underline"
          >
            {props.email}
          </a>
          <span class="mx-4 text-gray-600 dark:text-gray-400 print:text-gray-600">|</span>
          <span class="text-gray-800 dark:text-gray-200 print:text-gray-900">{props.phone}</span>
          <span class="mx-4 text-gray-600 dark:text-gray-400 print:text-gray-600">|</span>
          <a
            href={props.linkedin}
            target="_blank"
            rel="noopener"
            class="text-blue-600 dark:text-blue-400 print:text-blue-700 hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </header>

      {/* Summary */}
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 print:text-gray-900 mb-6 border-b-2 border-gray-300 dark:border-slate-700 print:border-gray-300 pb-2">
          Summary
        </h2>
        <p class="text-gray-700 dark:text-gray-300 print:text-gray-800 leading-relaxed">
          {props.summary}
        </p>
      </section>

      {/* Skills */}
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 print:text-gray-900 mb-6 border-b-2 border-gray-300 dark:border-slate-700 print:border-gray-300 pb-2">
          Technical Skills
        </h2>
        <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 print:text-gray-800 space-y-3 columns-1 md:columns-2 lg:columns-3 gap-8">
          <For each={Object.entries(props.skills)}>
            {([category, items]) => (
              <li class="break-inside-avoid">
                <strong>{category}:</strong> {items.join(', ')}
              </li>
            )}
          </For>
        </ul>
      </section>

      {/* Experience */}
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 print:text-gray-900 mb-6 border-b-2 border-gray-300 dark:border-slate-700 print:border-gray-300 pb-2">
          Experience
        </h2>
        <For each={props.experience}>
          {(job) => (
            <div class="mb-10 last:mb-0">
              <div class="flex flex-col md:flex-row justify-between items-start mb-3">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 print:text-gray-900">
                    {job.role}
                  </h3>
                  <p class="text-lg font-medium text-gray-800 dark:text-gray-200 print:text-gray-900">
                    {job.company}
                  </p>
                </div>
                <div class="text-right mt-2 md:mt-0">
                  <p class="text-gray-700 dark:text-gray-300 print:text-gray-800">{job.location}</p>
                  <p class="text-gray-600 dark:text-gray-400 print:text-gray-600 italic">
                    {job.dates}
                  </p>
                </div>
              </div>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 print:text-gray-800 space-y-2 ml-5">
                <For each={job.bullets}>{(bullet) => <li>{bullet}</li>}</For>
              </ul>
            </div>
          )}
        </For>
      </section>

      {/* Education */}
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 print:text-gray-900 mb-6 border-b-2 border-gray-300 dark:border-slate-700 print:border-gray-300 pb-2">
          Education
        </h2>
        <For each={props.education}>
          {(edu) => (
            <div class="mb-8 last:mb-0">
              <div class="flex flex-col md:flex-row justify-between items-start mb-3">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 print:text-gray-900">
                    {edu.degree}
                  </h3>
                  <p class="text-lg font-medium text-gray-800 dark:text-gray-200 print:text-gray-900">
                    {edu.school}
                  </p>
                </div>
                <div class="text-right mt-2 md:mt-0">
                  <p class="text-gray-700 dark:text-gray-300 print:text-gray-800">{edu.location}</p>
                  <p class="text-gray-600 dark:text-gray-400 print:text-gray-600 italic">
                    {edu.dates}
                  </p>
                </div>
              </div>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 print:text-gray-800 space-y-1 ml-5">
                <For each={edu.details}>
                  {(detail) => {
                    // case 1: plain string
                    if (typeof detail === 'string') {
                      return <li>{detail}</li>;
                    }

                    // case 2: labeled detail
                    const [label, value] = Object.entries(detail)[0];
                    return (
                      <li>
                        <strong>{label}:</strong> {value}
                      </li>
                    );
                  }}
                </For>
              </ul>
            </div>
          )}
        </For>
      </section>

      {/* Volunteering */}
      <section>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 print:text-gray-900 mb-6 border-b-2 border-gray-300 dark:border-slate-700 print:border-gray-300 pb-2">
          Volunteering
        </h2>
        <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 print:text-gray-800 space-y-2 ml-5">
          <For each={props.volunteering}>{(item) => <li>{item}</li>}</For>
        </ul>
      </section>
    </div>
  );
}
