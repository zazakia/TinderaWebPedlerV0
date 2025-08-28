import { mockProducts } from './__test-utils__/test-utils'

describe('Product Filtering and Sorting', () => {
  describe('Category Filtering', () => {
    it('should return all products when category is "All"', () => {
      const filtered = mockProducts.filter(product => {
        const matchesCategory = "All" === "All" || product.category === "All"
        return matchesCategory
      })

      expect(filtered).toHaveLength(mockProducts.length)
      expect(filtered).toEqual(mockProducts)
    })

    it('should filter products by specific category', () => {
      const targetCategory = "Soft Drinks" as string
      const filtered = mockProducts.filter(product => {
        const matchesCategory = targetCategory === "All" || product.category === targetCategory
        return matchesCategory
      })

      const expectedProducts = mockProducts.filter(p => p.category === targetCategory)
      expect(filtered).toEqual(expectedProducts)
      expect(filtered.every(p => p.category === targetCategory)).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const nonExistentCategory = "NonExistent" as string
      const filtered = mockProducts.filter(product => {
        const matchesCategory = "All" === nonExistentCategory || product.category === nonExistentCategory
        return matchesCategory
      })

      expect(filtered).toHaveLength(0)
    })

    it('should handle case-sensitive category matching', () => {
      const targetCategory = "soft drinks" as string // lowercase
      const filtered = mockProducts.filter(product => {
        const matchesCategory = "All" === targetCategory || product.category === targetCategory
        return matchesCategory
      })

      expect(filtered).toHaveLength(0) // Should not match due to case sensitivity
    })

    it('should get unique categories from products', () => {
      const categories = Array.from(new Set(mockProducts.map(p => p.category)))

      expect(categories).toContain("Soft Drinks")
      expect(categories).toContain("Snacks")
      expect(categories).toContain("Powder Drink")
      expect(categories).toHaveLength(3)
    })
  })

  describe('Search Functionality', () => {
    it('should filter products by name search', () => {
      const searchQuery = "Coke"
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Coke Mismo 100ML")
    })

    it('should handle case-insensitive search', () => {
      const searchQuery = "COKE"
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Coke Mismo 100ML")
    })

    it('should return multiple products for partial matches', () => {
      const searchQuery = "Tang"
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Tang Orange 25g")
    })

    it('should return empty array for no matches', () => {
      const searchQuery = "NonExistentProduct"
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(0)
    })

    it('should handle empty search query', () => {
      const searchQuery = ""
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(mockProducts.length)
    })

    it('should handle special characters in search', () => {
      const searchQuery = "100ML"
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Coke Mismo 100ML")
    })
  })

  describe('Combined Filtering', () => {
    it('should filter by both category and search query', () => {
      const searchQuery = "Coke"
      const selectedCategory = "Soft Drinks" as string

      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Coke Mismo 100ML")
      expect(filtered[0].category).toBe("Soft Drinks")
    })

    it('should return empty array when search and category don\'t match', () => {
      const searchQuery = "Coke"
      const selectedCategory = "Snacks" as string

      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })

      expect(filtered).toHaveLength(0)
    })

    it('should handle "All" category with search query', () => {
      const searchQuery = "25g"
      const selectedCategory = "All"

      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe("Tang Orange 25g")
    })
  })

  describe('Sorting Functionality', () => {
    it('should sort products alphabetically ascending', () => {
      const sorted = [...mockProducts].sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

      expect(sorted[0].name).toBe("Coke Mismo 100ML")
      expect(sorted[1].name).toBe("Piattos Cheese 40g")
      expect(sorted[2].name).toBe("Tang Orange 25g")
    })

    it('should sort products alphabetically descending', () => {
      const sorted = [...mockProducts].sort((a, b) => {
        return b.name.localeCompare(a.name)
      })

      expect(sorted[0].name).toBe("Tang Orange 25g")
      expect(sorted[1].name).toBe("Piattos Cheese 40g")
      expect(sorted[2].name).toBe("Coke Mismo 100ML")
    })

    it('should maintain sort order stability', () => {
      const productsWithDuplicates = [
        ...mockProducts,
        { ...mockProducts[0], id: 999 } // Duplicate name
      ]

      const sorted = productsWithDuplicates.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

      // First two should be the Coke products (original order preserved for same name)
      expect(sorted[0].name).toBe("Coke Mismo 100ML")
      expect(sorted[1].name).toBe("Coke Mismo 100ML")
    })

    it('should handle products with special characters', () => {
      const productsWithSpecialChars = [
        { ...mockProducts[0], name: "Product #1" },
        { ...mockProducts[1], name: "Product (2)" },
        { ...mockProducts[2], name: "Product-3" }
      ]

      const sorted = productsWithSpecialChars.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

      // Verify that sorting works and maintains correct order
      expect(sorted).toHaveLength(3)
      expect(sorted[0].name).toMatch(/^Product/)
      expect(sorted[1].name).toMatch(/^Product/)
      expect(sorted[2].name).toMatch(/^Product/)

      // Verify the array is sorted (each subsequent item should be >= previous)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i-1].name.localeCompare(sorted[i].name)).toBeLessThanOrEqual(0)
      }
    })

    it('should handle empty product list', () => {
      const sorted = ([] as typeof mockProducts).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

      expect(sorted).toHaveLength(0)
    })
  })

  describe('Complete Filtering and Sorting Pipeline', () => {
    it('should apply filtering and sorting in correct order', () => {
      const searchQuery = ""
      const selectedCategory = "All"
      const sortOrder = "asc"

      // First filter
      const filtered = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })

      // Then sort
      const filteredAndSorted = filtered.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.name.localeCompare(b.name)
        } else {
          return b.name.localeCompare(a.name)
        }
      })

      expect(filteredAndSorted).toHaveLength(3)
      expect(filteredAndSorted[0].name).toBe("Coke Mismo 100ML")
      expect(filteredAndSorted[1].name).toBe("Piattos Cheese 40g")
      expect(filteredAndSorted[2].name).toBe("Tang Orange 25g")
    })

    it('should handle complex filtering scenario', () => {
      const searchQuery = "o" // Should match Coke, Piattos, Tang
      const selectedCategory = "Soft Drinks" as string
      const sortOrder = "desc" as "asc" | "desc"

      const result = mockProducts
        .filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
          return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
          if (sortOrder === "asc") {
            return a.name.localeCompare(b.name)
          } else {
            return b.name.localeCompare(a.name)
          }
        })

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Coke Mismo 100ML")
      expect(result[0].category).toBe("Soft Drinks")
    })

    it('should maintain data integrity through filtering and sorting', () => {
      const originalProducts = [...mockProducts]
      const searchQuery = "Coke"
      const selectedCategory = "Soft Drinks" as string

      const result = mockProducts
        .filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
          return matchesSearch && matchesCategory
        })
        .sort((a, b) => a.name.localeCompare(b.name))

      // Verify the result has correct structure
      result.forEach(product => {
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('name')
        expect(product).toHaveProperty('price')
        expect(product).toHaveProperty('stock')
        expect(product).toHaveProperty('category')
        expect(product).toHaveProperty('units')
      })

      // Verify original array is unchanged
      expect(mockProducts).toEqual(originalProducts)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large product lists efficiently', () => {
      // Create a larger dataset
      const largeProductList = Array.from({ length: 100 }, (_, index) => ({
        ...mockProducts[index % mockProducts.length],
        id: index + 1,
        name: `${mockProducts[index % mockProducts.length].name} ${index + 1}`
      }))

      const searchQuery = "Coke"
      const selectedCategory = "All"

      const startTime = Date.now()

      const result = largeProductList
        .filter(product => {
          const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
          return matchesSearch && matchesCategory
        })
        .sort((a, b) => a.name.localeCompare(b.name))

      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Should complete in reasonable time (less than 100ms for 100 items)
      expect(executionTime).toBeLessThan(100)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle edge case with very long product names', () => {
      const longNameProduct = {
        ...mockProducts[0],
        name: 'A'.repeat(1000) // Very long name
      }

      const searchQuery = 'A'.repeat(100)
      const result = [longNameProduct].filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })

      expect(result).toHaveLength(1)
    })
  })
})