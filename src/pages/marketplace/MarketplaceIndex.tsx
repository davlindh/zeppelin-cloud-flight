import { Link } from 'react-router-dom';
import { Package, Gavel, Briefcase } from 'lucide-react';

export default function MarketplaceIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Välkommen till Zeppel <span className="text-amber-500">Inn</span> Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Din destination för auktioner, shopping och tjänster
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            to="/marketplace/auctions"
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-200 transition-colors">
                <Gavel className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Auktioner</h2>
              <p className="text-gray-600 mb-6">
                Bjud på spännande auktioner och hitta unika föremål
              </p>
              <div className="flex items-center text-amber-600 font-semibold group-hover:translate-x-2 transition-transform">
                Utforska auktioner →
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          </Link>

          <Link
            to="/marketplace/shop"
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Butik</h2>
              <p className="text-gray-600 mb-6">
                Handla produkter direkt från vårt sortiment
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                Besök butiken →
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          </Link>

          <Link
            to="/marketplace/services"
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Tjänster</h2>
              <p className="text-gray-600 mb-6">
                Boka professionella tjänster från våra partners
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                Utforska tjänster →
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/home"
            className="inline-flex items-center text-gray-600 hover:text-amber-600 transition-colors"
          >
            ← Tillbaka till huvudsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
