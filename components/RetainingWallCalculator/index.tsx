"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ------------------------- utilidades ------------------------------*/
const deg2rad = (deg: number) => (deg * Math.PI) / 180;
const num = (v: string | number) => parseFloat(v.toString()) || 0;

/* ------------------------- interfaces ----------------------------*/
interface WallData {
  altura: number;
  gamma_solo: number;
  ang_atrito: number;
  coesao: number;
  sobrecarga: number;
  base_interna: number;
  base_externa: number;
  altura_maior: number;
  altura_menor: number;
  largura_topo: number;
  largura_base_parede: number;
  gamma_concreto: number;
  mu: number;
  sigma_adm: number;
}

interface CalculationResult {
  Ka: string;
  Pa: string;
  W: string;
  FS_desl: string;
  FS_tomb: string;
  e: string;
  sigma_max: string;
  vd_desl: boolean;
  vd_tomb: boolean;
  vd_press: boolean;
}

/* ------------------------- cálculo simplificado --------------------*/
function calcular(d: WallData) {
  // Alias para deixar a fórmula mais legível
  const H = d.altura;
  const gamma_s = d.gamma_solo;
  const phi = d.ang_atrito;
  const c = d.coesao;
  const q = d.sobrecarga;

  /* Geometria → aproximamos:
   *  - B_in / B_ex = bases interna/externa
   *  - t_base = média (altura maior + menor)
   *  - t_stem = média (largura topo + largura base parede)
   */
  const B_in = d.base_interna;
  const B_ex = d.base_externa;
  const B = B_in + B_ex;
  const t_base = (d.altura_maior + d.altura_menor) / 2;
  const t_stem = (d.largura_topo + d.largura_base_parede) / 2;

  const gamma_c = d.gamma_concreto;
  const mu = d.mu;
  const sigma_adm = d.sigma_adm;

  /* Empuxo ativo Rankine (solo horizontal) */
  const Ka = Math.tan(deg2rad(45 - phi / 2)) ** 2;
  const Pa = 0.5 * gamma_s * H ** 2 * Ka + q * H * Ka;
  const Mo = Pa * H / 3;

  /* Pesos */
  const V_base = B * t_base;
  const V_stem = t_stem * H; // assume espessura constante
  const W = gamma_c * (V_base + V_stem);
  const x_W = B_ex + t_stem / 2;
  const Mr = W * x_W;

  /* Verificações */
  const R_desl = W * mu + c * B;
  const FS_desl = R_desl / Pa;
  const FS_tomb = Mr / Mo;
  const e = (Mr - Mo) / W;
  const sigma_max = (W / B) * (1 + (6 * e) / B);
  const ok_pressao = sigma_max <= sigma_adm && Math.abs(e) <= B / 6;

  return {
    Ka: Ka.toFixed(3), Pa: Pa.toFixed(2), W: W.toFixed(2),
    FS_desl: FS_desl.toFixed(2), FS_tomb: FS_tomb.toFixed(2),
    e: e.toFixed(3), sigma_max: sigma_max.toFixed(1),
    vd_desl: FS_desl >= 1.5, vd_tomb: FS_tomb >= 2.0, vd_press: ok_pressao,
  };
}

/* ------------------------- componente principal --------------------*/
export default function Page() {
  const [dados, setDados] = useState({
    /* Geral */
    nome: "M1",
    altura: 3,
    elevacao: 0,
    formato: "cantilever", // cantilever / gravidade
    tipo_concreto: "CA",

    /* Empuxo / Solo */
    gamma_solo: 18,
    ang_atrito: 30,
    coesao: 0,
    sobrecarga: 5,

    /* Parede */
    largura_topo: 0.3,
    incl_int: 5, incl_ext: 0,
    largura_base_parede: 0.6,

    /* Base */
    base_interna: 1.0, base_externa: 1.0,
    altura_maior: 0.7, altura_menor: 0.4,

    /* Dente */
    dente_base: 0.2, dente_altura: 0,

    /* Materiais / Capacidade */
    gamma_concreto: 24,
    mu: 0.5,
    sigma_adm: 200,
  });

  const [res, setRes] = useState<CalculationResult | null>(null);
  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement> | string | number) => {
    const value = typeof e === 'object' ? e.target.value : e;
    setDados({ ...dados, [k]: num(value) });
  };

  return (
    <main className="p-6 max-w-6xl mx-auto font-sans">
      {/* ---------------- Cabecalho Geral ---------------- */}
      <Card className="mb-4">
        <CardContent className="p-4 grid grid-cols-10 gap-4 text-sm">
          <label className="col-span-2">
            Nome
            <Input value={dados.nome} onChange={on("nome")} />
          </label>
          <label className="col-span-1">
            Altura (m)
            <Input type="number" step="0.1" value={dados.altura} onChange={on("altura")} />
          </label>
          <label className="col-span-1">
            Elevação (cm)
            <Input type="number" step="1" value={dados.elevacao} onChange={on("elevacao")} />
          </label>
          <label className="col-span-2">
            Tipo
            <Select defaultValue={dados.tipo_concreto} onValueChange={(v)=>setDados({...dados,tipo_concreto:v})}>
              <SelectTrigger><SelectValue placeholder="Concreto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">Concreto armado</SelectItem>
                <SelectItem value="CC">Concreto ciclópico</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="col-span-2">
            Formato
            <Select defaultValue={dados.formato} onValueChange={(v)=>setDados({...dados,formato:v})}>
              <SelectTrigger><SelectValue placeholder="Formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cantilever">Cantilever</SelectItem>
                <SelectItem value="gravidade">Gravidade</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      {/* ---------------- Abas ---------------- */}
      <Tabs defaultValue="empuxo">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="empuxo">Empuxo / Solo</TabsTrigger>
          <TabsTrigger value="geometria">Geometria</TabsTrigger>
          <TabsTrigger value="cargas">Capacidade</TabsTrigger>
        </TabsList>

        {/* Empuxo */}
        <TabsContent value="empuxo">
          <Card><CardContent className="grid grid-cols-4 gap-4 p-4">
            <label>γ solo (kN/m³)<Input type="number" step="0.1" value={dados.gamma_solo} onChange={on("gamma_solo")} /></label>
            <label>φ (°)<Input type="number" step="1" value={dados.ang_atrito} onChange={on("ang_atrito")} /></label>
            <label>Coesão c (kN/m²)<Input type="number" step="1" value={dados.coesao} onChange={on("coesao")} /></label>
            <label>Sobrecarga q (kN/m²)<Input type="number" step="0.1" value={dados.sobrecarga} onChange={on("sobrecarga")} /></label>
          </CardContent></Card>
        </TabsContent>

        {/* Geometria */}
        <TabsContent value="geometria">
          <Card><CardContent className="p-4 space-y-6">
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div className="col-span-6 font-semibold">Parede</div>
              <label>Largura topo (m)<Input type="number" step="0.01" value={dados.largura_topo} onChange={on("largura_topo")} /></label>
              <label>Incl. interna (°)<Input type="number" step="1" value={dados.incl_int} onChange={on("incl_int")} /></label>
              <label>Incl. externa (°)<Input type="number" step="1" value={dados.incl_ext} onChange={on("incl_ext")} /></label>
              <label>Largura base pared. (m)<Input type="number" step="0.01" value={dados.largura_base_parede} onChange={on("largura_base_parede")} /></label>
            </div>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div className="col-span-6 font-semibold">Base</div>
              <label>Base interna (m)<Input type="number" step="0.05" value={dados.base_interna} onChange={on("base_interna")} /></label>
              <label>Base externa (m)<Input type="number" step="0.05" value={dados.base_externa} onChange={on("base_externa")} /></label>
              <label>Altura maior (m)<Input type="number" step="0.01" value={dados.altura_maior} onChange={on("altura_maior")} /></label>
              <label>Altura menor (m)<Input type="number" step="0.01" value={dados.altura_menor} onChange={on("altura_menor")} /></label>
            </div>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div className="col-span-6 font-semibold">Dente</div>
              <label>Base (m)<Input type="number" step="0.01" value={dados.dente_base} onChange={on("dente_base")} /></label>
              <label>Altura (m)<Input type="number" step="0.01" value={dados.dente_altura} onChange={on("dente_altura")} /></label>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* Capacidade / Material */}
        <TabsContent value="cargas">
          <Card><CardContent className="grid grid-cols-4 gap-4 p-4">
            <label>γ concreto (kN/m³)<Input type="number" step="0.1" value={dados.gamma_concreto} onChange={on("gamma_concreto")} /></label>
            <label>µ (atrito base)<Input type="number" step="0.05" value={dados.mu} onChange={on("mu")} /></label>
            <label>σ adm (kN/m²)<Input type="number" step="5" value={dados.sigma_adm} onChange={on("sigma_adm")} /></label>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-6"><Button onClick={()=>setRes(calcular(dados))}>Calcular</Button></div>

      {res && (
        <Card className="mt-6"><CardContent className="p-4 space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <h3 className="font-semibold">Empuxo</h3>
              Ka = {res.Ka} <br />Pₐ = {res.Pa} kN/m
            </div>
            <div>
              <h3 className="font-semibold">Pesos</h3>
              W = {res.W} kN/m<br />e = {res.e} m
            </div>
            <div>
              <h3 className="font-semibold">σ_max</h3>
              {res.sigma_max} kN/m² → {res.vd_press ? <span className="text-green-600 font-bold">OK</span> : <span className="text-red-600 font-bold">ERRO</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-2 rounded-lg">Deslizamento F.S. = {res.FS_desl} {res.vd_desl ? <span className="text-green-600 font-bold">OK</span> : <span className="text-red-600 font-bold">ERRO</span>}</div>
            <div className="border p-2 rounded-lg">Tombamento F.S. = {res.FS_tomb} {res.vd_tomb ? <span className="text-green-600 font-bold">OK</span> : <span className="text-red-600 font-bold">ERRO</span>}</div>
          </div>
        </CardContent></Card>
      )}

      <footer className="text-center text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} – Exemplo didático (ajuste coeficientes /
        fórmulas conforme norma). Alguns parâmetros visuais ainda não influem no
        cálculo – sinta‑se livre para conectar.
      </footer>
    </main>
  );
}
