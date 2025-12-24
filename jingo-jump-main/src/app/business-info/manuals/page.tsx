import type { Metadata } from "next";
import { FileText, Download, BookOpen, Shield } from "lucide-react";
import { NavBar, SiteFooter } from "../../_components/landing";

export const metadata: Metadata = {
  title: "Manuals & Safety Documents - Jingo Jump",
  description:
    "Download operation manuals and safety instructions for Jingo Jump inflatable products.",
};

const documents = [
  {
    title: "Inflatable Operation Manual",
    description: "Complete user manual for operating inflatable products safely and effectively.",
    icon: BookOpen,
    url: "https://www.jingojump.com/wp-content/uploads/2024/05/user_manual.pdf?_gl=1*1l1jw0b*_gcl_au*MTcyNjc5NTg4NS4xNzY1MjU1MTk4*_ga*MTUxODM0NDgwLjE3NjUyNTUxOTg.*_ga_8VPNY1QX78*czE3NjY1MzcwNTYkbzYkZzEkdDE3NjY1MzczNTgkajU2JGwwJGgw",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    hoverBorder: "hover:border-blue-500",
  },
  {
    title: "Bouncer Safety Instructions",
    description: "Essential safety guidelines for bouncer operation and supervision.",
    icon: Shield,
    url: "https://www.jingojump.com/wp-content/uploads/2024/05/Bouncer_Safety22.pdf?_gl=1*1l1jw0b*_gcl_au*MTcyNjc5NTg4NS4xNzY1MjU1MTk4*_ga*MTUxODM0NDgwLjE3NjUyNTUxOTg.*_ga_8VPNY1QX78*czE3NjY1MzcwNTYkbzYkZzEkdDE3NjY1MzczNTgkajU2JGwwJGgw",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    hoverBorder: "hover:border-green-500",
  },
  {
    title: "Combo Safety Instructions",
    description: "Safety protocols for combo units with multiple features.",
    icon: Shield,
    url: "https://www.jingojump.com/wp-content/uploads/2024/05/Combo_Sefaty22.pdf?_gl=1*1l1jw0b*_gcl_au*MTcyNjc5NTg4NS4xNzY1MjU1MTk4*_ga*MTUxODM0NDgwLjE3NjUyNTUxOTg.*_ga_8VPNY1QX78*czE3NjY1MzcwNTYkbzYkZzEkdDE3NjY1MzczNTgkajU2JGwwJGgw",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    hoverBorder: "hover:border-purple-500",
  },
  {
    title: "Water Slide Safety Instructions",
    description: "Important safety information for water slide setup and usage.",
    icon: Shield,
    url: "https://www.jingojump.com/wp-content/uploads/2024/05/WaterSlide_Sefaty22.pdf?_gl=1*pvnhb5*_gcl_au*MTcyNjc5NTg4NS4xNzY1MjU1MTk4*_ga*MTUxODM0NDgwLjE3NjUyNTUxOTg.*_ga_8VPNY1QX78*czE3NjY1MzcwNTYkbzYkZzEkdDE3NjY1Mzc5MjEkajU2JGwwJGgw",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    hoverBorder: "hover:border-cyan-500",
  },
];

export default function ManualsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="pt-40 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Manuals & Safety Documents
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Download comprehensive operation manuals and safety instructions to ensure proper setup, operation, and maintenance of your Jingo Jump inflatable products.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-12">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Safety First</h3>
                <p className="text-amber-800 leading-relaxed">
                  Please read all safety instructions carefully before operating any inflatable equipment. Proper supervision and adherence to safety guidelines are essential for preventing injuries and ensuring a fun, safe experience for all users.
                </p>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group ${doc.bgColor} border-2 ${doc.borderColor} ${doc.hoverBorder} rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${doc.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Additional Resources Section */}
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Additional Resources
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              More safety documents and operation manuals will be added soon. If you need specific documentation or have questions about product operation, please don&apos;t hesitate to contact our support team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 shadow-md"
              >
                Contact Support
              </a>
              <a
                href="/business-info/opportunity"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-300"
              >
                Business Resources
              </a>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-500 transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Read Before Setup
              </h3>
              <p className="text-neutral-600 text-sm">
                Always review the operation manual before setting up your inflatable for the first time.
              </p>
            </div>

            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-500 transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Keep Documents Handy
              </h3>
              <p className="text-neutral-600 text-sm">
                Store safety instructions in an accessible location for quick reference during events.
              </p>
            </div>

            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-500 transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Share with Staff
              </h3>
              <p className="text-neutral-600 text-sm">
                Ensure all staff members have access to and understand the safety guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
