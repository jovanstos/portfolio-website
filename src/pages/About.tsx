import "../styles/About.css";
import Timeline from "../components/Timeline";
import Stars from "../components/Stars";
import FadeInSection from "../components/FadeInSection";

function About() {
  const timelineItems = [
    {
      id: "t1",
      date: "August 2020",
      title: "Started My CS Degree",
      description: "It's peak COVID and I started college.",
    },
    {
      id: "t2",
      date: "January 2021",
      title: "Lost My FAFSA",
      description: "My mother remarried and I had financial stress.",
    },
    {
      id: "t3",
      date: "February 2023",
      title: "I Sold My Car & Started Bootcamp",
      description: "Took the massive risk to try and change my life!",
    },
    {
      id: "t4",
      date: "August 2023",
      title: "Got Hired At RIM Logistics",
      description: "I got the job!",
    },
    {
      id: "t5",
      date: "August 2024",
      title: "Went Back To College Online",
      description:
        "I worked full time while also doing college. Super exhausting.",
    },
    {
      id: "t6",
      date: "December 2025",
      title: "Graduated College",
      description: "After fighting for years I finally did it!",
    },
    {
      id: "t100",
      date: "February 2026",
      title: "Left RIM Logistics",
      description: "Took the risk to grow as an engineer!",
    },
  ];

  return (
    <div id="about-background">
      <Stars speed={5} />
      <main id="about">
        <h1 style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>
          About Me
        </h1>
        <p style={{ color: "white", textAlign: "center" }}>
          It's a good read trust me, but if you don't just read the TLDR;
        </p>
        <FadeInSection>
          <section className="about-section">
            <img src="temp.jpg" width={"180px"} alt="About" />
            <article className="about-article-right">
              <h2>TLDR;</h2>
              <p>
                I had many setbacks during COVID from 2020 to 2022, so I took a
                massive risk and sold everything I had to go to a boot camp. I
                learned there that I need to push myself if I want to really
                become a software engineer. I was able to earn a job as a
                software engineer through my hard work. Still, I wanted more and
                to finally finish my degree, so I went back to school while
                working full-time for 1 year, until I graduated in December
                2025.
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>I Sold My Car For This</h2>
              <p>
                You read that correctly. I sold my car so I could become a
                software engineer. It was a necessary risk I had to take, a leap
                of faith in hopes that I could finally become what I’ve wanted
                for years. Before we get to that part, my story begins in August
                of 2020, during COVID. I was a college freshman starting my
                computer science degree. I’ve always wanted to program. I grew
                up with computers, so I’ve known I wanted to work with them from
                a very early age.
              </p>
            </article>
            <img src="temp.jpg" width={"180px"} alt="About" />
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <img src="temp.jpg" width={"180px"} alt="About" />
            <article className="about-article-right">
              <h2>Where Is Everybody?</h2>
              <p>
                School during this period was unorganized and a nightmare; they
                weren’t prepared to handle all of this online. I was very scared
                and hoping it would all work out, but when I went to apply for
                my classes, I saw I didn’t even exist! I reached out to my high
                school counselor, but that person had quit, so that led to
                nothing. I reached out to the counselor I had met in college,
                who handled my engineering program, and she no longer worked
                there either! I didn’t know what to do because I didn’t exist in
                my college's system, and my high school never sent them any of
                my paperwork. It was horrible, but eventually, through many
                phone calls and emails, I was finally in the system!
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>Happily Married.</h2>
              <p>
                I finally got to go to school, and I had to fill out the FAFSA
                because my mom was a single mom and my family was poor. I was
                only working part-time at the moment to afford my car. This soon
                turned into me having to work while in school, so I could also
                afford my education. My mother remarried, so my very next
                semester in 2021, my FAFSA was taken away, meaning I now had to
                pay this out of pocket or take out a loan. Thankfully I went to
                community college to save money, but the bill was still pretty
                large. I paid for it cause education was still my priority, so I
                fought as one should.
              </p>
            </article>
            <img src="temp.jpg" width={"180px"} alt="About" />
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <img src="temp.jpg" width={"180px"} alt="About" />
            <article className="about-article-right">
              <h2>Disaster</h2>
              <p>
                I was struggling and stressed, having to do school and work all
                the time to pay for everything; it was exhausting. If only
                things had gotten easier, but sadly, disaster struck! I
                dislocated my knee in a physical accident, leaving me injured
                and unable to focus on my studies. This caused me to withdraw
                from my classes, costing me time and money. Then, a few months
                later, the company I was working for at the time fell on hard
                times and had to let go of all of its part-time workers. So now
                I was at a low. What to do?
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <article className="about-article-left">
              <h2>Taking The Risk</h2>
              <p>
                I need to figure out where to go from here, and I hear about the
                opportunity to attend a software engineering bootcamp. The issue
                was that it cost $15,000 to sign up and do it for 4 months. I
                didn’t have the kind of money, but I did have one asset to my
                name: my car. So, since I had nothing left to lose, I sold it
                and went to boot camp. The boot camp was just mediocre, but it
                made me realize I need to work hard and become a great engineer,
                or this is the end of the line for me. So I would stay up all
                night learning and practicing programming. I eventually worked
                so hard, around the end of the boot camp, landed my first job as
                a software engineer at RIM Logistics.
              </p>
            </article>
            <img src="temp.jpg" width={"180px"} alt="About" />
          </section>
        </FadeInSection>
        <FadeInSection>
          <section className="about-section">
            <img src="temp.jpg" width={"180px"} alt="About" />
            <article className="about-article-right">
              <h2>Getting My Degree</h2>
              <p>
                While working as a software engineer, something didn’t sit right
                with me. I didn’t like the fact that I never got my degree, and
                I wanted to reach higher. I wanted to achieve more. I had this
                new hunger to go further, so I signed up for college online to
                get my bachelor's degree in Computer Science. I then worked
                tirelessly, bouncing between working full-time and doing school
                every day, for 1 year, until I finished and graduated in
                December 2025! I finally got my degree!
              </p>
            </article>
          </section>
        </FadeInSection>
        <FadeInSection>
          <h1 style={{ color: "white", textAlign: "center" }}>Timeline</h1>
          <p style={{ color: "white", textAlign: "center" }}>
            Here is a timeline of key events
          </p>
          <section>
            <Timeline items={timelineItems} />
          </section>
        </FadeInSection>
      </main>
    </div>
  );
}

export default About;
