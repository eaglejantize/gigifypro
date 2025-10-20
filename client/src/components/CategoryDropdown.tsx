import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ServiceCategory } from "@shared/schema";

interface CategoryDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
}

// Group categories for better organization
const POPULAR_CATEGORIES = [
  "Home Repair",
  "Personal Chef",
  "Fitness Training",
  "House Cleaning",
];

export function CategoryDropdown({
  value,
  onChange,
  placeholder = "Select category...",
  showAllOption = true,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const selectedCategory = categories?.find((cat) => cat.id === value);

  const popularCats = categories?.filter((cat) =>
    POPULAR_CATEGORIES.includes(cat.name)
  );
  const otherCats = categories?.filter(
    (cat) => !POPULAR_CATEGORIES.includes(cat.name)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          data-testid="button-category-dropdown"
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search services..."
            data-testid="input-category-search"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No services found.</CommandEmpty>
            
            {showAllOption && (
              <CommandGroup heading="All Services">
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  data-testid="option-category-all"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All Categories
                </CommandItem>
              </CommandGroup>
            )}

            {popularCats && popularCats.length > 0 && (
              <CommandGroup heading="Popular Services">
                {popularCats.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.id);
                      setOpen(false);
                    }}
                    data-testid={`option-category-${category.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {otherCats && otherCats.length > 0 && (
              <CommandGroup heading="All Services">
                {otherCats.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.id);
                      setOpen(false);
                    }}
                    data-testid={`option-category-${category.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
