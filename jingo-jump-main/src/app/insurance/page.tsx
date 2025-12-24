import type { Metadata } from "next";
import { Phone, Globe } from "lucide-react";
import { NavBar, SiteFooter } from "../_components/landing";

export const metadata: Metadata = {
  title: "Inflatable Insurance Providers",
  description:
    "Find trusted insurance providers for your inflatable rental business. Connect with specialists who understand the bounce house and inflatable industry.",
};

const insuranceProviders = [
  {
    name: "Maria Olmos",
    company: "Cossio Insurance Agency",
    phone: "(864) 688-0121 ext 118",
    website: "www.cossioinsurance.com",
  },
  {
    name: "Jeff Web",
    company: "EIB Direct",
    phone: "(801) 304-5570",
    website: "www.eibdirect.com",
  },
  {
    name: "Sam Muradyan",
    company: "Insure My Jumper",
    phone: "(888) 688-3788",
    website: "www.insuremyjumper.com",
  },
  {
    name: "Geoffrey Boyd",
    company: "Allied Specialty",
    phone: "(800) 237-3355",
    website: "www.alliedspecialty.com",
  },
  {
    name: "We Insure Inflatables",
    company: "We Insure Inflatables",
    phone: "(864) 862-2838",
    website: "www.weinsureinflatables.com",
  },
  {
    name: "Sandi Swift",
    company: "Friedman Specialty Insurance",
    phone: "(563) 556-0272",
    website: "www.friedmanspecialtyinsurance.com",
  },
];

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="pt-40 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Inflatable Insurance Providers
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Connect with trusted insurance specialists who understand your inflatable rental business needs
            </p>
          </div>

          {/* Providers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceProviders.map((provider, index) => (
              <div
                key={index}
                className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                {/* Name & Company */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">
                    {provider.name}
                  </h2>
                  <p className="text-sm text-neutral-600">{provider.company}</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  {/* Phone */}
                  <a
                    href={`tel:${provider.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 text-neutral-700 hover:text-primary-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Phone className="w-5 h-5 text-primary-500" />
                    </div>
                    <span className="font-medium">{provider.phone}</span>
                  </a>

                  {/* Website */}
                  <a
                    href={`https://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-neutral-700 hover:text-primary-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Globe className="w-5 h-5 text-primary-500" />
                    </div>
                    <span className="font-medium break-all">{provider.website}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-500">
              These insurance providers specialize in inflatable rental businesses. Contact them directly for quotes and coverage options.
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
