import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingBag, FiHeart, FiTruck } from "react-icons/fi";

const features = [
  {
    icon: <FiHeart />,
    title: "Stylish & Elegant",
    desc: "Pochi za kisasa zilizochaguliwa kwa ladha ya wanawake wa kisasa.",
  },
  {
    icon: <FiTruck />,
    title: "Fast Local Delivery",
    desc: "Delivery ya haraka Dar es Salaam na miji ya karibu.",
  },
  {
    icon: <FiShoppingBag />,
    title: "Secure Shopping",
    desc: "Nunua kwa uhakika, malipo salama na order tracking.",
  },
];

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Pochi za Wanawake <br />
              <span className="text-pink-100">
                Elegance • Confidence • Style
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-pink-100 max-w-lg">
              Chagua pochi zinazokufanya ujisikie confident kila siku.
              Ubora wa hali ya juu, muonekano wa kuvutia, na delivery ya haraka.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/shop"
                className="text-center bg-white text-pink-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
              >
                Nunua Sasa
              </Link>

              <Link
                to="/register"
                className="text-center border border-white/70 px-6 py-3 rounded-full hover:bg-white hover:text-pink-600 transition"
              >
                Jiunge Nasi
              </Link>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-sm mx-auto md:max-w-none rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
              <img
                src="/images/hero-bag.png"
                alt="Ladies handbag"
                className="w-3/4 drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-14"
          >
            Kwa nini Ununue Kwetu?
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow hover:shadow-xl transition"
              >
                <div className="text-pink-500 text-3xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-xl mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto px-4 md:px-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Jifanye Uonekane wa Kipekee 🌸
          </h2>
          <p className="text-pink-100 mb-8">
            Jiunge leo uanze safari ya style, elegance na confidence.
          </p>
          <Link
            to="/shop"
            className="bg-white text-pink-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            Anza Kununua
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
