import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppFloat from '@/components/store/WhatsAppFloat'
import Image from 'next/image'
import Link from 'next/link'
import styles from './about.module.css'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className="container">
            <span className={styles.tagline}>OUR STORY & PASSION</span>
            <h1 className={styles.heroTitle}>Freshly Made. Naturally Delicious.</h1>
            <p className={styles.heroSub}>
              Crafted daily with love, fresh milk, and pure organic ingredients right here in Kumasi, Ghana.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={`container ${styles.grid}`}>
            <div className={styles.storyContent}>
              <h2>The Sweet Spoon Journey</h2>
              <p>
                Founded by <strong>Hetty</strong>, Sweet Spoon was born out of a simple desire: to provide
                authentic, unadulterated, wholesome yogurt and traditional millet snacks that feed the body and soul.
              </p>
              <p>
                In a market filled with artificial preservatives, excessive refined sugars, and powdered milk substitutes,
                Sweet Spoon stands firm on real nutrition. We use 100% fresh cow's milk from vetted local farms, live active probiotic cultures,
                and premium natural fruits.
              </p>
              <div className={styles.highlightsGrid}>
                <div className={styles.highlightCard}>
                  <span className={styles.highlightIcon}>🥛</span>
                  <h4>100% Pure Milk</h4>
                  <p>No artificial thickeners or powdered substitutes.</p>
                </div>
                <div className={styles.highlightCard}>
                  <span className={styles.highlightIcon}>🌿</span>
                  <h4>Live Probiotics</h4>
                  <p>Guaranteed digestive health and gut immunity in every spoonful.</p>
                </div>
                <div className={styles.highlightCard}>
                  <span className={styles.highlightIcon}>🍓</span>
                  <h4>Real Fruits</h4>
                  <p>Fresh strawberry, mango, pineapple, and honey infusions.</p>
                </div>
              </div>
            </div>

            <div className={styles.storyImageWrapper}>
              <Image
                src="/about_section_banner.jpg"
                alt="Sweet Spoon by Hetty Yogurt Production"
                width={550}
                height={450}
                className={styles.storyImg}
              />
            </div>
          </div>
        </section>

        {/* Products Spotlight */}
        <section className={styles.productsBanner}>
          <div className="container">
            <h2>Our Signature Range</h2>
            <div className={styles.rangeGrid}>
              <div className={styles.rangeCard}>
                <h3>Greek Yogurt</h3>
                <p>Thick, velvety, high-protein Greek yogurt drained to perfection. Available in Plain Unsweetened, Honey-sweetened, and Fruit Infusions.</p>
              </div>
              <div className={styles.rangeCard}>
                <h3>Probiotic Yogurt Drink</h3>
                <p>Silky, refreshing drinkable yogurt loaded with millions of active gut-friendly cultures for glowing health.</p>
              </div>
              <div className={styles.rangeCard}>
                <h3>Authentic Brukina</h3>
                <p>Traditional millet and yogurt drink blended with aromatic nutmeg and rich cream for an authentic Ghanaian taste experience.</p>
              </div>
            </div>
            <div className={styles.ctaWrapper}>
              <Link href="/shop" className={styles.ctaBtn}>
                Explore Full Menu & Order Now →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
