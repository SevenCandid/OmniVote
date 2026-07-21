import React, { useState, useMemo } from 'react';
import { usePermissions } from '../hooks/useRbac';
import { Permission } from '../schemas/rbacSchema';
import { BaseInput } from '../../../components/ui/BaseInput';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface PermissionSelectorProps {
  selectedIds: string[];
  onChange?: (ids: string[]) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  selectedIds,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const { data: allPermissions, isLoading } = usePermissions();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};
    const filtered = allPermissions.filter(
      (p) =>
        p.display_name.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.reduce(
      (acc, perm) => {
        const cat = perm.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [allPermissions, search]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: prev[cat] === undefined ? false : !prev[cat],
    }));
  };

  const handleTogglePermission = (id: string) => {
    if (disabled || !onChange) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleToggleGroup = (categoryPermissions: Permission[]) => {
    if (disabled || !onChange) return;
    const catIds = categoryPermissions.map((p) => p.id);
    const allSelected = catIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      onChange(selectedIds.filter((id) => !catIds.includes(id)));
    } else {
      const newSelected = new Set([...selectedIds, ...catIds]);
      onChange(Array.from(newSelected));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 h-64 rounded-xl" />
    );
  }

  const categories = Object.keys(groupedPermissions).sort();

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          className="pl-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            No permissions found matching your search.
          </div>
        ) : (
          categories.map((category) => {
            const perms = groupedPermissions[category];
            const isExpanded = expandedCategories[category] !== false; // default true
            const allSelected =
              perms.length > 0 &&
              perms.every((p) => selectedIds.includes(p.id));
            const someSelected =
              perms.some((p) => selectedIds.includes(p.id)) && !allSelected;

            return (
              <div key={category} className="bg-white dark:bg-[#18181B]">
                <div
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer select-none"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                    <span className="font-semibold text-sm capitalize">
                      {category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {perms.length}
                    </span>
                  </div>
                  {!disabled && onChange && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleGroup(perms);
                      }}
                      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                        allSelected
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {perms.map((perm) => {
                      const isSelected = selectedIds.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                            disabled
                              ? 'opacity-70 cursor-not-allowed'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5 relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={isSelected}
                              onChange={() => handleTogglePermission(perm.id)}
                              disabled={disabled}
                            />
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'bg-transparent border-zinc-300 dark:border-zinc-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1 peer-focus:ring-offset-white dark:peer-focus:ring-offset-zinc-900'
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  className="w-3.5 h-3.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                              {perm.display_name}
                              <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                {perm.key}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {perm.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
