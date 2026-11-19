import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate, officeAddress } from '../../core/format';
import type { JobOpening, Site } from '../../core/models';
import { pageResolver } from '../../core/page-data';
import { abs, breadcrumbs } from '../../core/schema';
import { CareerFormComponent } from '../../shared/career-form.component';
import { IconComponent } from '../../shared/icon.component';
import { MOTION } from '../../shared/motion.directives';
import { PageBase, PageFallbackComponent } from '../../shared/page-base';
import { PageHeroComponent } from '../../shared/page-hero.component';
import { SectionHeaderComponent } from '../../shared/section-header.component';


@Component({
  selector: 'app-careers-page',
  imports: [RouterLink, IconComponent, PageHeroComponent, SectionHeaderComponent, CareerFormComponent, PageFallbackComponent, ...MOTION],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './careers.page.html',
})
export class CareersPage extends PageBase<JobOpening[]> {
  readonly fmt = formatDate;
  readonly jobTitle = (j: JobOpening) => j.title;
  readonly form = viewChild(CareerFormComponent);
  readonly crumbs = [{ name: 'Home', href: '/' }, { name: 'Career', href: '/careers/' }];
  readonly headAddress = computed(() => {
    const s = this.ok()?.site;
    const head = s?.offices.find((o) => o.headOffice) ?? s?.offices[0];
    return head ? officeAddress(head) : '';
  });
  readonly heading = computed(() => {
    const n = this.ok()?.data.length ?? 0;
    return n ? `${n} open position${n > 1 ? 's' : ''}` : 'No open positions right now';
  });
  readonly culture = [
    { icon: 'school', title: 'Learn across disciplines', text: 'Work beside Chartered Accountants, MBAs and engineers, and build judgement across finance, engineering and risk.' },
    { icon: 'groups', title: 'Direct access to leadership', text: 'Partner-led mandates mean you work closely with the firm’s leaders from the first briefing to delivery.' },
    { icon: 'domain', title: 'Work that matters', text: 'Contribute to highways, ports, transit, industrial and urban projects that shape India’s growth.' },
    { icon: 'favorite', title: 'A caring environment', text: 'We demonstrate care and concern for every individual, and every employee participates in the success of the firm.' },
  ];
  readonly steps = [
    { title: 'Choose a role', text: 'Pick a current opening below, or select “General application” to be considered for future roles.' },
    { title: 'Prepare your CV', text: 'A single PDF, DOC or DOCX file of up to 5 MB. Include qualifications, experience and contact details.' },
    { title: 'Submit the form', text: 'Fill in the application form and attach your CV. Fields marked * are required.' },
    { title: 'Hear from us', text: 'If your profile matches a current or upcoming role, our team will contact you for the next steps.' },
  ];

  apply(title: string) {
    this.form()?.choose(title);
  }

  protected meta(_site: Site, jobs: JobOpening[]) {
    return {
      title: 'Careers — Current Openings & Job Applications',
      description: 'Careers at Spine Advisory: current openings in transaction advisory, investment banking, engineering and risk consulting. Apply online with your CV.',
      schema: [
        breadcrumbs(this.crumbs),
        ...jobs.map((j) => ({
          '@type': 'JobPosting',
          title: j.title,
          description: [j.summary, 'Responsibilities: ' + j.responsibilities.join('; '), 'Qualifications: ' + j.qualifications.join('; ')].filter(Boolean).join(' '),
          datePosted: j.posted,
          ...(j.closes ? { validThrough: `${j.closes}T23:59:59+05:30` } : {}),
          employmentType: j.employmentType.toUpperCase().replace('-', '_'),
          hiringOrganization: { '@id': 'https://spineadvisory.com/#organization' },
          jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: j.location, addressCountry: 'IN' } },
          experienceRequirements: j.experience,
          qualifications: j.qualifications.join('; '),
          responsibilities: j.responsibilities.join('; '),
          url: abs(`/careers/#${j.id}`),
        })),
      ],
    };
  }
}
