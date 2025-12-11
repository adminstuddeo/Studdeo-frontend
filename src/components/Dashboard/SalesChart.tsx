import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { TrendingUp } from 'lucide-react';

const SalesChart: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-900 font-montserrat">Ventas de Este Mes</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-400 font-montserrat">
          {/* Placeholder para el gráfico */}
          <div className="text-center">
            <p className="text-sm">Gráfico de ventas</p>
            <p className="text-xs mt-2">Integrar librería de gráficos aquí</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
