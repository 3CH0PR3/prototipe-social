
## 📋 Descripción

Componente de tabla simple y fácil de mantener con Bootstrap 5.

## ✅ Ventajas sobre BaseDataTable

| BaseDataTable (Complejo)           | SimpleDataTable (Simple)     |
| ---------------------------------- | ---------------------------- |
| `:rows="users.map(toRow)"`         | `:rows="users"`              |
| Necesita función `toRow()`         | Datos directos               |
| Slots solo para columnas definidas | Slots para CUALQUIER columna |
| ResizeObserver complejo            | Sin lógica innecesaria       |
| Sistema de expansión               | Tabla simple y clara         |

## 🚀 Uso Básico

```vue
<script setup>
import SimpleDataTable from '@shared/components/dataTable/SimpleDataTable.vue';

const users = ref([{ id: 1, name: 'Juan', email: 'juan@example.com', role: 'Admin' }]);

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rol' }
];
</script>

<template>
  <SimpleDataTable title="Usuarios" :rows="users" :columns="columns" />
</template>
```

## 🎨 Props

| Prop        | Tipo    | Default       | Descripción               |
| ----------- | ------- | ------------- | ------------------------- |
| `title`     | String  | `''`          | Título de la tabla        |
| `subtitle`  | String  | `''`          | Subtítulo                 |
| `rows`      | Array   | **requerido** | Datos de la tabla         |
| `columns`   | Array   | **requerido** | Definición de columnas    |
| `loading`   | Boolean | `false`       | Estado de carga           |
| `showIndex` | Boolean | `false`       | Mostrar columna de índice |
| `striped`   | Boolean | `false`       | Filas rayadas             |
| `hover`     | Boolean | `true`        | Efecto hover              |

## 📊 Definición de Columnas

```javascript
const columns = [
  {
    key: 'name', // Clave del dato en el objeto
    label: 'Nombre', // Texto del encabezado
    align: 'left', // 'left', 'center', 'right'
    width: '200px' // Ancho opcional
  }
];
```

## 🎯 Slots Personalizados

### ✅ AHORA PUEDES USAR CUALQUIER SLOT

```vue
<SimpleDataTable :rows="users" :columns="columns">
  
  <!-- Slot para columna 'name' -->
  <template #cell-name="{ row, value, index }">
    <strong>{{ value }}</strong>
  </template>

  <!-- Slot para columna 'avatar' (¡FUNCIONA aunque no esté en columns!) -->
  <template #cell-avatar="{ row }">
    <img :src="row.avatar" class="rounded-circle" />
  </template>

  <!-- Slot para columna 'status' -->
  <template #cell-status="{ row }">
    <span class="badge bg-success">{{ row.status }}</span>
  </template>

  <!-- Slot para estado vacío -->
  <template #empty>
    <p>No hay datos</p>
  </template>

</SimpleDataTable>
```

### 📦 Datos del Slot

Cada slot `#cell-{key}` recibe:

- `row`: Objeto completo de la fila
- `value`: Valor de `row[column.key]`
- `index`: Índice de la fila

## 💡 Ejemplos Completos

### Ejemplo 1: Tabla con Avatar y Acciones

```vue
<script setup>
const users = ref([
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'active'
  }
]);

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Estado', align: 'center' },
  { key: 'actions', label: 'Acciones', align: 'center', width: '150px' }
];

const handleEdit = (user) => {
  console.log('Editar:', user);
};
</script>

<template>
  <SimpleDataTable title="Usuarios" :rows="users" :columns="columns" :show-index="true">
    <!-- Avatar + Nombre -->
    <template #cell-name="{ row }">
      <div class="d-flex align-items-center gap-2">
        <img :src="row.avatar" class="rounded-circle" style="width: 32px; height: 32px;" />
        <span>{{ row.name }}</span>
      </div>
    </template>

    <!-- Estado con badge -->
    <template #cell-status="{ row }">
      <span class="badge" :class="row.status === 'active' ? 'bg-success' : 'bg-danger'">
        {{ row.status }}
      </span>
    </template>

    <!-- Botones de acción -->
    <template #cell-actions="{ row }">
      <button class="btn btn-sm btn-primary" @click="handleEdit(row)">Editar</button>
    </template>
  </SimpleDataTable>
</template>
```

### Ejemplo 2: Tabla con 15 Columnas (Fácil de Mantener)

```vue
<script setup>
const products = ref([...]) // 100 productos

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: 'Nombre' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Categoría' },
  { key: 'price', label: 'Precio', align: 'right' },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'supplier', label: 'Proveedor' },
  { key: 'brand', label: 'Marca' },
  { key: 'weight', label: 'Peso' },
  { key: 'dimensions', label: 'Dimensiones' },
  { key: 'color', label: 'Color' },
  { key: 'material', label: 'Material' },
  { key: 'warranty', label: 'Garantía' },
  { key: 'rating', label: 'Rating', align: 'center' },
  { key: 'actions', label: 'Acciones', align: 'center' }
]
</script>

<template>
  <SimpleDataTable :rows="products" :columns="columns">
    <!-- Solo personaliza las columnas que necesites -->

    <template #cell-price="{ value }">
      <strong>${{ value.toFixed(2) }}</strong>
    </template>

    <template #cell-stock="{ value }">
      <span :class="value < 10 ? 'text-danger' : 'text-success'">
        {{ value }}
      </span>
    </template>

    <template #cell-rating="{ value }">
      <span class="badge bg-warning">⭐ {{ value }}/5</span>
    </template>

    <template #cell-actions="{ row }">
      <button class="btn btn-sm btn-primary">Ver</button>
    </template>

    <!-- Las otras 11 columnas se renderizan automáticamente -->
  </SimpleDataTable>
</template>
```

## 🎭 Eventos

```vue
<SimpleDataTable
  :rows="users"
  :columns="columns"
  @row-click="handleRowClick"
  @edit="handleEdit"
  @delete="handleDelete"
>
```

## 🆚 Comparación de Código

### ❌ BaseDataTable (Complejo)

```vue
<!-- Necesitas transformar los datos -->
<BaseDataTable
  :rows="users.map(toRow)"
  :columns="columns"
  :sort-field="sortField"
  :sort-dir="sortDir"
  row-key="id"
  @sort="handleSort"
>
  <!-- cell-img NO FUNCIONA si 'img' no está en columns -->
  <template #cell-img="{ row }">
    <img :src="row.avatar" />
  </template>
</BaseDataTable>

<script>
// Necesitas esta función extra
const toRow = (user) => {
  return {
    ...user,
    statusBadge: {
      active: { text: 'Activo', variant: 'success' }
    }[user.status]
  };
};
</script>
```

### ✅ SimpleDataTable (Simple)

```vue
<!-- Datos directos, sin transformación -->
<SimpleDataTable :rows="users" :columns="columns">
  <!-- CUALQUIER slot funciona -->
  <template #cell-avatar="{ row }">
    <img :src="row.avatar" />
  </template>

  <template #cell-status="{ row }">
    <span class="badge bg-success">
      {{ row.status === 'active' ? 'Activo' : 'Inactivo' }}
    </span>
  </template>
</SimpleDataTable>

<!-- No necesitas función toRow() -->
```

## 🎯 Conclusión

**SimpleDataTable es:**

- ✅ Más fácil de entender
- ✅ Más fácil de mantener
- ✅ Más flexible (slots para cualquier columna)
- ✅ Sin lógica innecesaria
- ✅ Bootstrap puro, sin Tailwind
- ✅ Perfecto para tablas con 5 o 50 columnas

**Usa SimpleDataTable para:**

- Tablas de usuarios
- Tablas de productos
- Tablas de pedidos
- Cualquier tabla CRUD
- Tablas con muchas columnas personalizadas
