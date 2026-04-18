-- =============================================================
-- Cotizador Nuestros Parques — Schema Supabase
-- Ejecutar en: Dashboard → SQL Editor → New query
-- =============================================================

-- Cotizaciones
create table cotizaciones (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  vendedor_id     uuid references auth.users(id) on delete set null,
  estado          text not null default 'pendiente',
  nota            text,
  producto_nombre text,
  valor_con_descuento numeric,
  comision_uf     numeric,
  data            jsonb not null default '{}'
);

create index on cotizaciones (vendedor_id);
create index on cotizaciones (created_at desc);

-- Plan overrides (precios y condiciones personalizadas por producto)
create table plan_overrides (
  producto_slug   text primary key,
  overrides       jsonb not null default '{}',
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users(id) on delete set null
);

-- Tablas de factores (valores editables; lógica de cálculo queda en el código)
create table factor_tables (
  tabla_key   text primary key,
  factors     jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Tablas de comisiones (valores editables)
create table commission_tables (
  tabla_key   text primary key,
  tabla       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- Row Level Security
-- =============================================================

-- Cotizaciones: cada vendedor solo ve y modifica las suyas
alter table cotizaciones enable row level security;
create policy "vendedor_sus_cotizaciones"
  on cotizaciones for all
  using (auth.uid() = vendedor_id);

-- Plan overrides: todos los autenticados pueden leer y escribir
alter table plan_overrides enable row level security;
create policy "auth_plan_overrides"
  on plan_overrides for all
  using (auth.role() = 'authenticated');

-- Factor tables: todos los autenticados
alter table factor_tables enable row level security;
create policy "auth_factor_tables"
  on factor_tables for all
  using (auth.role() = 'authenticated');

-- Commission tables: todos los autenticados
alter table commission_tables enable row level security;
create policy "auth_commission_tables"
  on commission_tables for all
  using (auth.role() = 'authenticated');

-- =============================================================
-- Seed: Tablas de factores (vigencia Febrero 2026)
-- =============================================================
insert into factor_tables (tabla_key, factors) values
  ('sepultura_uf', '{"18":0.05857,"24":0.04466,"36":0.03076,"48":0.02383,"60":0.01968,"72":0.01693,"84":0.01497,"96":0.01361,"108":0.01238}'),
  ('liberador_uf', '{"12":0.08641,"18":0.05857,"24":0.04466,"30":0.03632,"36":0.03076}');

-- =============================================================
-- Seed: Tablas de comisiones
-- =============================================================
insert into commission_tables (tabla_key, tabla) values
('sepulturas', '{
  "byRange": [
    {"desde":1,"hasta":1,
      "A":{"com":4,"premios":[{"c":2,"p":1}]},
      "B":{"com":1.5,"premios":[{"c":2,"p":1},{"c":4,"p":1},{"c":6,"p":1}]},
      "C":{"com":0.5,"premios":[{"c":2,"p":1},{"c":4,"p":1},{"c":6,"p":1},{"c":7,"p":0.5}]}},
    {"desde":2,"hasta":2,
      "A":{"com":8,"premios":[{"c":2,"p":2}]},
      "B":{"com":3,"premios":[{"c":2,"p":2},{"c":4,"p":2},{"c":6,"p":2}]},
      "C":{"com":1,"premios":[{"c":2,"p":2},{"c":4,"p":2},{"c":6,"p":2},{"c":7,"p":1}]}},
    {"desde":3,"hasta":5,
      "A":{"com":9.6,"premios":[{"c":2,"p":2.4}]},
      "B":{"com":3.6,"premios":[{"c":2,"p":2.4},{"c":4,"p":2.4},{"c":6,"p":2.4}]},
      "C":{"com":1.2,"premios":[{"c":2,"p":2.4},{"c":4,"p":2.4},{"c":6,"p":2.4},{"c":7,"p":1.2}]}},
    {"desde":6,"hasta":null,
      "A":{"com":10.4,"premios":[{"c":2,"p":2.6}]},
      "B":{"com":3.9,"premios":[{"c":2,"p":2.6},{"c":4,"p":2.6},{"c":6,"p":2.6}]},
      "C":{"com":1.3,"premios":[{"c":2,"p":2.6},{"c":4,"p":2.6},{"c":6,"p":2.6},{"c":7,"p":1.3}]}}
  ]
}'),
('aumento_mausoleo', '{
  "byRange": [
    {"desde":1,"hasta":null,
      "A":{"com":8,"premios":[{"c":2,"p":2}]},
      "B":{"com":3,"premios":[{"c":2,"p":2},{"c":4,"p":2},{"c":6,"p":2}]},
      "C":{"com":1,"premios":[{"c":2,"p":2},{"c":4,"p":2},{"c":6,"p":2},{"c":7,"p":1}]}}
  ]
}'),
('liberador', '{
  "byRange": [
    {"desde":1,"hasta":null,
      "A":{"com":5,"premios":[]},
      "C":{"com":0.7,"premios":[{"c":2,"p":1.2},{"c":4,"p":1.2},{"c":6,"p":1.2},{"c":7,"p":0.7}]}}
  ]
}'),
('cineracion_nf', '{
  "byRange": [
    {"desde":1,"hasta":null,
      "A":{"com":4,"premios":[{"c":2,"p":1}]},
      "B":{"com":1.5,"premios":[{"c":2,"p":1},{"c":4,"p":1},{"c":6,"p":1}]},
      "C":{"com":0.5,"premios":[{"c":2,"p":1},{"c":4,"p":1},{"c":6,"p":1},{"c":7,"p":0.5}]}}
  ]
}'),
('planas', '{
  "servicio-funerario-tradicional": {"com":5,"activacionFNP":3},
  "servicio-funerario-esencial":    {"com":5,"activacionFNP":3},
  "servicio-funerario-nf":          {"com":10,"activacionFNP":null},
  "cineracion-linea-inicial":       {"com":5,"activacionFNP":null},
  "cineracion-linea-homenaje":      {"com":5,"activacionFNP":null},
  "cineracion-linea-gran-homenaje": {"com":5,"activacionFNP":null}
}');
