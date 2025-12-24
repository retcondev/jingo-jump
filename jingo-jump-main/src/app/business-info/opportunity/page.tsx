import type { Metadata } from "next";
import { TrendingUp, Calendar, DollarSign, Smile, Scale } from "lucide-react";
import { NavBar, SiteFooter } from "../../_components/landing";

export const metadata: Metadata = {
  title: "Business Opportunity - Start Your Inflatable Rental Business",
  description:
    "Discover the profitable inflatable bounce house rental business opportunity. Low startup costs, flexible schedule, and growing demand.",
};

const advantages = [
  {
    icon: TrendingUp,
    title: "Growing Demand",
    description:
      "With the growth in popularity of themed birthday parties and events, the demand for inflatable jumpers has increased. Parents continuously seek exclusive and animating ways to entertain their children and teens, and inflatable bounce houses perfectly satisfy everyone.",
  },
  {
    icon: DollarSign,
    title: "Low Direct and Indirect Costs",
    description:
      "One of the most appealing attributes of starting an inflatable jumper rental business is the relatively low overhead costs. Unlike other businesses that require the high cost of producing goods or services, an inflatable jumper's business can be operated from home or in a small facility.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description:
      "As a business owner, you have the flexibility to set your schedule convenient to your timetable. Most events and parties occur on weekends or evenings, allowing you to maintain a full-time job during the day while still running your rental business on the side.",
  },
  {
    icon: Scale,
    title: "Scalability",
    description:
      "As your business grows, you can expand your inventory and reach a larger customer base. Adding new and exciting inflatable units, such as water slides, obstacle courses, sports and games, or bounce houses, can draw attention to more customers and increase your revenue.",
  },
  {
    icon: Smile,
    title: "Joy of Bringing Smiles",
    description:
      "Perhaps the most rewarding aspect of running an inflatable jumper party rental business is the joy and happiness that brings to your customers. The pleasure of seeing the smiles on children's faces as they bounce, slide, and play brings a sense of enjoyment that few other businesses can offer.",
  },
];

const earningsData = [
  { units: 1, weekly: "$300", monthly: "$1,200", annually: "$14,400" },
  { units: 2, weekly: "$400", monthly: "$1,600", annually: "$19,200" },
  { units: 3, weekly: "$600", monthly: "$2,400", annually: "$28,800" },
  { units: 10, weekly: "$2,000", monthly: "$8,000", annually: "$96,000" },
];

export default function BusinessOpportunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="pt-40 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Business Opportunity
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Want to start a business? Jingo Jump Inc. is here to help. The Inflatable Bounce House rental business is a rapidly growing industry in the market in the United States and abroad. It is a part-time business with full-time profitability.
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-lg mb-12">
            <p className="text-neutral-700 leading-relaxed">
              You don&apos;t have to give up your 8 to 5 job or go door by door to promote your product. It is part-time work and done mainly at weekends and it has low startup cost. You don&apos;t need specific training or skills. This business proves to be one of the most profitable businesses for its fast cash return.
            </p>
          </div>

          {/* Advantages Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              Why This Business Works
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          {advantage.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed">
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Earnings Potential */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 text-center">
              Earnings Potential
            </h2>
            <p className="text-neutral-600 text-center mb-8 max-w-3xl mx-auto">
              Typically, each Jumper rents at least 2 times per week mainly on Saturdays and Sundays, likewise during the weekdays and overnight. This is a sample chart showing how much you can earn by renting inflatable bouncer units if you rent them for $100 per day. Water slides and combos can be rented from $150 to $400 a day.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-primary-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Rented Units</th>
                    <th className="px-6 py-4 text-left font-bold">Weekly</th>
                    <th className="px-6 py-4 text-left font-bold">Monthly</th>
                    <th className="px-6 py-4 text-left font-bold">Annually</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.map((row, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-neutral-50" : "bg-white"
                      } hover:bg-primary-50 transition-colors`}
                    >
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        {row.units}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">{row.weekly}</td>
                      <td className="px-6 py-4 text-neutral-700">{row.monthly}</td>
                      <td className="px-6 py-4 font-bold text-primary-600">
                        {row.annually}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial vs Semi-Commercial */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              Commercial vs Semi-Commercial
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Commercial Grade */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">
                  Commercial Grade Inflatables
                </h3>
                <div className="space-y-4 text-neutral-700">
                  <div>
                    <span className="font-bold text-amber-900">Material:</span> Made of a heavier 18 oz PVC vinyl
                  </div>
                  <div>
                    <span className="font-bold text-amber-900">Weight:</span> Heavier and may require more labor to transport, set up, and take down
                  </div>
                  <div>
                    <span className="font-bold text-amber-900">Pros:</span> Having employees or help on the job can make commercial inflatables easier to handle
                  </div>
                  <div>
                    <span className="font-bold text-amber-900">Longevity:</span> With proper care, they can last for many years—some customers have had theirs for over 15 years!
                  </div>
                </div>
              </div>

              {/* Semi-Commercial */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Semi-Commercial Inflatables
                </h3>
                <div className="space-y-4 text-neutral-700">
                  <div>
                    <span className="font-bold text-blue-900">Material:</span> Made of 15 oz PVC vinyl and lighter 7 oz PVC vinyl in some areas
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Weight:</span> Lighter material makes them easier to transport, move around, and set up
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Budget-Friendly:</span> More affordable option for those starting out
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Durability:</span> Can still last for many years if properly maintained
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financing Info */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
              Financing Info
            </h2>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Affirm</h3>
              <p className="text-neutral-700 leading-relaxed">
                We&apos;re now happy to offer the opportunity to pay off your items in 3, 6, or 12 months thanks to Affirm. For example, on a $700 purchase, you may have 0% interest for 3 months or only $63.18 for 12 months with a 15% APR.
              </p>
            </div>
          </div>

          {/* Building Customer Base */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              How to Build a Customer Base
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-primary-500 transition-all">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Leverage Social Media
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Social media platforms such as Facebook, Instagram, and TikTok have become intense tools for businesses to increase their consumer base and improve their brand name visibility. By applying social media efficiently, you can optimize the customer experience, reach your business goals, and establish strong online marketing.
                </p>
              </div>

              <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-primary-500 transition-all">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Business Cards and Flyers
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  When designing business cards and flyers, there are several key elements to consider, ensuring they effectively represent your brand and convey your message. KPrint can serve your marketing tools to make them visually appealing and informative to leave a positive impression on your potential customers or clients.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Business?</h2>
            <p className="text-lg mb-6 text-white/90">
              Contact us today to learn more about getting started with your inflatable rental business
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-neutral-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
