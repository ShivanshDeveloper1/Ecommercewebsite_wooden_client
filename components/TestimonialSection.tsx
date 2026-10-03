export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};

export default function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="section-wrap border-y border-(--line) py-14 sm:py-20" aria-labelledby="testimonials-title">
      <div className="mb-8 sm:mb-10">
        <p className="eyebrow">KIND WORDS</p>
        <h2 id="testimonials-title" className="font-serif text-3xl font-normal text-(--ink)">Made to be lived with.</h2>
      </div>
      {testimonials.length ? (
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="flex flex-col justify-between gap-5">
              <p className="font-serif text-lg leading-relaxed text-(--ink)">“{testimonial.quote}”</p>
              <footer className="text-xs leading-5 text-(--muted)">
                <span className="block font-medium text-(--moss)">{testimonial.name}</span>
                <span>{testimonial.detail}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      ) : <p className="text-sm text-(--muted)">Customer stories are on their way.</p>}
    </section>
  );
}
