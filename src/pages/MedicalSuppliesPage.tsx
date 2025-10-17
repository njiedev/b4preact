import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import supabase from "@/supabase";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

// Type definitions
interface SupplyItem {
  id: string;
  name: string;
  description: string;
  lotNumber: string;
  expiresOn: string;
  quantity: number;
  imageUrl: string;
  isExpired: boolean;
  typeOfSupply: string;
  palletLocation: string;
  company: string;
  cardboardBoxesPerPallet: number;
  unitBoxesPerCardboard: number;
  unitsPerBox: number;
  weightPerCardboardBox: number;
  dimensionsCardboardBox: string;
  costPerUnitBox: number;
  costPerCardboardBox: number;
  relevantLink: string;
  otherNotes: string;
}

export function MedicalSuppliesPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expiredFilter, setExpiredFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [formData, setFormData] = useState<Partial<SupplyItem>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);


  // Fetch data from Supabase
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("medical_supplies")
        .select("*");

      if (error) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load medical supplies: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No data found in database");
        setItems([]);
        setFilteredItems([]);
        return;
      }

      // Transform the data to match our interface
      const transformedData: SupplyItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        lotNumber: item.lot_number || "",
        expiresOn: item.expires_on || "2025-12-31",
        quantity: item.quantity || 0,
        imageUrl: item.image_url || "/logo.png",
        isExpired: item.is_expired || false,
        typeOfSupply: item.type_of_supply || "",
        palletLocation: item.pallet_location || "",
        company: item.company || "",
        cardboardBoxesPerPallet: item.cardboard_boxes_per_pallet || 0,
        unitBoxesPerCardboard: item.unit_boxes_per_cardboard || 0,
        unitsPerBox: item.units_per_box || 0,
        weightPerCardboardBox: item.weight_per_cardboard_box || 0,
        dimensionsCardboardBox: item.dimensions_cardboard_box || "",
        costPerUnitBox: item.cost_per_unit_box || 0,
        costPerCardboardBox: item.cost_per_cardboard_box || 0,
        relevantLink: item.relevant_link || "",
        otherNotes: item.other_notes || "",
      }));

      setItems(transformedData);
      setFilteredItems(transformedData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load medical supplies");
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on search and filters
  useEffect(() => {
    const filtered = items.filter((item) => {
      const matchesText =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.typeOfSupply.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesExpiry =
        expiredFilter === "all" ||
        (expiredFilter === "expired" && item.isExpired) ||
        (expiredFilter === "not-expired" && !item.isExpired);

      const matchesType =
        typeFilter === "all" ||
        item.typeOfSupply === typeFilter;

      return matchesText && matchesExpiry && matchesType;
    });

    setFilteredItems(filtered);
  }, [items, searchQuery, expiredFilter, typeFilter]);

  const handleItemClick = (item: SupplyItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Form handling functions
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditModal = (item: SupplyItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsEditModalOpen(true);
    setIsItemModalOpen(false);
  };

  const openNewItemModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      lotNumber: "",
      expiresOn: "",
      quantity: 0,
      imageUrl: "/logo.png",
      isExpired: false,
      typeOfSupply: "",
      palletLocation: "",
      company: "",
      cardboardBoxesPerPallet: 0,
      unitBoxesPerCardboard: 0,
      unitsPerBox: 0,
      weightPerCardboardBox: 0,
      dimensionsCardboardBox: "",
      costPerUnitBox: 0,
      costPerCardboardBox: 0,
      relevantLink: "",
      otherNotes: "",
    });
    setIsNewItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!formData.name || !formData.quantity || !formData.typeOfSupply || !formData.expiresOn) {
        toast.error("Please fill in all required fields");
        return;
      }

      const databaseData = {
        name: formData.name,
        description: formData.description || "",
        lot_number: formData.lotNumber || "",
        expires_on: formData.expiresOn,
        quantity: formData.quantity || 0,
        image_url: formData.imageUrl || "/logo.png",
        is_expired: formData.isExpired || false,
        type_of_supply: formData.typeOfSupply,
        pallet_location: formData.palletLocation || "",
        company: formData.company || "",
        cardboard_boxes_per_pallet: formData.cardboardBoxesPerPallet || 0,
        unit_boxes_per_cardboard: formData.unitBoxesPerCardboard || 0,
        units_per_box: formData.unitsPerBox || 0,
        weight_per_cardboard_box: formData.weightPerCardboardBox || 0,
        dimensions_cardboard_box: formData.dimensionsCardboardBox || "",
        cost_per_unit_box: formData.costPerUnitBox || 0,
        cost_per_cardboard_box: formData.costPerCardboardBox || 0,
        relevant_link: formData.relevantLink || "",
        other_notes: formData.otherNotes || "",
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('medical_supplies')
          .update(databaseData)
          .eq('id', editingItem.id)
          .select();

        if (error) {
          console.error("Error updating item:", error);
          toast.error("Failed to update item");
          return;
        }

        toast.success("Item updated successfully!");
      } else {
        // Create new item
        const { error } = await supabase
          .from('medical_supplies')
          .insert([databaseData])
          .select();

        if (error) {
          console.error("Error creating item:", error);
          toast.error("Failed to create item");
          return;
        }

        toast.success("Item created successfully!");
      }

      // Refresh the data
      await fetchItems();
      
      // Close modals
      setIsEditModalOpen(false);
      setIsNewItemModalOpen(false);
      setFormData({});
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medical supplies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">B4P Surplus Medical Supplies</h1>
              <p className="text-sm text-gray-600">Browse, search, and organize available items</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Search and Filters */}
        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:max-w-md">
            <Label htmlFor="searchInput" className="sr-only">Search items</Label>
            <div className="relative">
              <Input
                id="searchInput"
                type="search"
                placeholder="Search by name, type of supply..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 4.243 12h.007l4.75 4.75a.75.75 0 1 0 1.06-1.06l-4.75-4.75v-.007A6.75 6.75 0 0 0 10.5 3.75ZM5.25 10.5a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="expiredFilter" className="text-sm text-gray-700">Item expired</Label>
              <Select value={expiredFilter} onValueChange={setExpiredFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="not-expired">Not expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="typeFilter" className="text-sm text-gray-700">Type of supply</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Airway and Oxygen">Airway and Oxygen</SelectItem>
                  <SelectItem value="Catheters and IV Supplies">Catheters and IV Supplies</SelectItem>
                  <SelectItem value="PPE">PPE</SelectItem>
                  <SelectItem value="Needles and Syringes">Needles and Syringes</SelectItem>
                  <SelectItem value="Wound Care">Wound Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* New Item Button */}
        <section className="flex justify-end mb-4">
          <Button onClick={openNewItemModal} className="bg-green-600 hover:bg-green-700">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Item
          </Button>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-md border bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Units</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Type of Supply</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const expiryClasses = item.isExpired 
                    ? "text-red-700 bg-red-50 ring-1 ring-red-200" 
                    : "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
                  const expiryLabel = item.isExpired ? "Expired" : "Active";

                  return (
                    <TableRow 
                      key={item.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <span className="text-lg font-semibold text-gray-900">{item.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2">
                          <span className={`rounded px-2 py-0.5 text-xs ${expiryClasses}`}>
                            {expiryLabel}
                          </span>
                          <time className="text-xs text-gray-600">{item.expiresOn}</time>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20">
                          {item.typeOfSupply}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={item.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-md border border-gray-200 p-1 hover:border-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img 
                            src={item.imageUrl} 
                            alt={`${item.name} image`} 
                            className="h-12 w-20 rounded object-cover transition group-hover:opacity-90" 
                          />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Item Detail Modal */}
        <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.name}</DialogTitle>
              <DialogDescription>
                View detailed information about this medical supply item
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Description:</span> {selectedItem.description}</p>
                      <p><span className="font-medium">Lot Number:</span> {selectedItem.lotNumber}</p>
                      <p><span className="font-medium">Company:</span> {selectedItem.company}</p>
                      <p><span className="font-medium">Pallet Location:</span> {selectedItem.palletLocation}</p>
                      <p><span className="font-medium">Quantity:</span> {selectedItem.quantity}</p>
                      <p><span className="font-medium">Expiration:</span> {selectedItem.expiresOn}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedItem.isExpired 
                            ? "text-red-700 bg-red-50 ring-1 ring-red-200" 
                            : "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200"
                        }`}>
                          {selectedItem.isExpired ? "Expired" : "Active"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Additional Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Type of Supply:</span> {selectedItem.typeOfSupply}</p>
                      <p><span className="font-medium">Cardboard Boxes per Pallet:</span> {selectedItem.cardboardBoxesPerPallet}</p>
                      <p><span className="font-medium">Unit Boxes per Cardboard:</span> {selectedItem.unitBoxesPerCardboard}</p>
                      <p><span className="font-medium">Units per Box:</span> {selectedItem.unitsPerBox}</p>
                      <p><span className="font-medium">Weight per Cardboard Box:</span> {selectedItem.weightPerCardboardBox} kg</p>
                      <p><span className="font-medium">Dimensions:</span> {selectedItem.dimensionsCardboardBox}</p>
                    </div>
                  </div>
                </div>
                
                {selectedItem.relevantLink && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Relevant Link</h3>
                    <a 
                      href={selectedItem.relevantLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {selectedItem.relevantLink}
                    </a>
                  </div>
                )}
                
                {selectedItem.otherNotes && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Other Notes</h3>
                    <p className="text-gray-700">{selectedItem.otherNotes}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => selectedItem && openEditModal(selectedItem)}>
                    Edit Item
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Item Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update the information for this medical supply item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Required Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Required Information</h3>
                    
                    <div>
                      <Label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="editName"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="editQuantity"
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="editTypeOfSupply" className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Supply <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.typeOfSupply || ""} onValueChange={(value) => handleInputChange("typeOfSupply", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PPE">PPE</SelectItem>
                          <SelectItem value="Airway and Oxygen">Airway and Oxygen</SelectItem>
                          <SelectItem value="Catheters and IV Supplies">Catheters and IV Supplies</SelectItem>
                          <SelectItem value="Needles and Syringes">Needles and Syringes</SelectItem>
                          <SelectItem value="Wound Care">Wound Care</SelectItem>
                          <SelectItem value="Surgical">Surgical</SelectItem>
                          <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editExpiresOn" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="editExpiresOn"
                        type="date"
                        value={formData.expiresOn || ""}
                        onChange={(e) => handleInputChange("expiresOn", e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editIsExpired"
                        checked={formData.isExpired || false}
                        onCheckedChange={(checked) => handleInputChange("isExpired", checked === true)}
                      />
                      <Label htmlFor="editIsExpired" className="text-sm font-medium text-gray-700">
                        Mark as Expired
                      </Label>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                      <Textarea
                        id="editDescription"
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editLotNumber" className="block text-sm font-medium text-gray-700 mb-1">Lot Number</Label>
                      <Input
                        id="editLotNumber"
                        value={formData.lotNumber || ""}
                        onChange={(e) => handleInputChange("lotNumber", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editCompany" className="block text-sm font-medium text-gray-700 mb-1">Company</Label>
                      <Input
                        id="editCompany"
                        value={formData.company || ""}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editPalletLocation" className="block text-sm font-medium text-gray-700 mb-1">Pallet Location</Label>
                      <Input
                        id="editPalletLocation"
                        value={formData.palletLocation || ""}
                        onChange={(e) => handleInputChange("palletLocation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Physical Properties */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Physical Properties</h3>
                    
                    <div>
                      <Label htmlFor="editWeightPerCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Weight per Cardboard Box (kg)</Label>
                      <Input
                        id="editWeightPerCardboardBox"
                        type="number"
                        value={formData.weightPerCardboardBox || 0}
                        onChange={(e) => handleInputChange("weightPerCardboardBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editDimensionsCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</Label>
                      <Input
                        id="editDimensionsCardboardBox"
                        value={formData.dimensionsCardboardBox || ""}
                        onChange={(e) => handleInputChange("dimensionsCardboardBox", e.target.value)}
                        placeholder="e.g., 30x20x15"
                      />
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Financial Information</h3>
                    
                    <div>
                      <Label htmlFor="editCostPerUnitBox" className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit Box ($)</Label>
                      <Input
                        id="editCostPerUnitBox"
                        type="number"
                        value={formData.costPerUnitBox || 0}
                        onChange={(e) => handleInputChange("costPerUnitBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editCostPerCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Cost per Cardboard Box ($)</Label>
                      <Input
                        id="editCostPerCardboardBox"
                        type="number"
                        value={formData.costPerCardboardBox || 0}
                        onChange={(e) => handleInputChange("costPerCardboardBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
                    
                    <div>
                      <Label htmlFor="editRelevantLink" className="block text-sm font-medium text-gray-700 mb-1">Relevant Link</Label>
                      <Input
                        id="editRelevantLink"
                        type="url"
                        value={formData.relevantLink || ""}
                        onChange={(e) => handleInputChange("relevantLink", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editOtherNotes" className="block text-sm font-medium text-gray-700 mb-1">Other Notes</Label>
                      <Textarea
                        id="editOtherNotes"
                        value={formData.otherNotes || ""}
                        onChange={(e) => handleInputChange("otherNotes", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Item Modal */}
        <Dialog open={isNewItemModalOpen} onOpenChange={setIsNewItemModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new medical supply item to the inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Required Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Required Information</h3>
                    
                    <div>
                      <Label htmlFor="newItemName" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="newItemName"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="newItemQuantity"
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemTypeOfSupply" className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Supply <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.typeOfSupply || ""} onValueChange={(value) => handleInputChange("typeOfSupply", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PPE">PPE</SelectItem>
                          <SelectItem value="Airway and Oxygen">Airway and Oxygen</SelectItem>
                          <SelectItem value="Catheters and IV Supplies">Catheters and IV Supplies</SelectItem>
                          <SelectItem value="Needles and Syringes">Needles and Syringes</SelectItem>
                          <SelectItem value="Wound Care">Wound Care</SelectItem>
                          <SelectItem value="Surgical">Surgical</SelectItem>
                          <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="newItemExpiresOn" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="newItemExpiresOn"
                        type="date"
                        value={formData.expiresOn || ""}
                        onChange={(e) => handleInputChange("expiresOn", e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newItemIsExpired"
                        checked={formData.isExpired || false}
                        onCheckedChange={(checked) => handleInputChange("isExpired", checked === true)}
                      />
                      <Label htmlFor="newItemIsExpired" className="text-sm font-medium text-gray-700">
                        Mark as Expired
                      </Label>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="newItemDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
                      <Textarea
                        id="newItemDescription"
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemLotNumber" className="block text-sm font-medium text-gray-700 mb-1">Lot Number</Label>
                      <Input
                        id="newItemLotNumber"
                        value={formData.lotNumber || ""}
                        onChange={(e) => handleInputChange("lotNumber", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemCompany" className="block text-sm font-medium text-gray-700 mb-1">Company</Label>
                      <Input
                        id="newItemCompany"
                        value={formData.company || ""}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemPalletLocation" className="block text-sm font-medium text-gray-700 mb-1">Pallet Location</Label>
                      <Input
                        id="newItemPalletLocation"
                        value={formData.palletLocation || ""}
                        onChange={(e) => handleInputChange("palletLocation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Physical Properties */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Physical Properties</h3>
                    
                    <div>
                      <Label htmlFor="newItemWeightPerCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Weight per Cardboard Box (kg)</Label>
                      <Input
                        id="newItemWeightPerCardboardBox"
                        type="number"
                        value={formData.weightPerCardboardBox || 0}
                        onChange={(e) => handleInputChange("weightPerCardboardBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemDimensionsCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</Label>
                      <Input
                        id="newItemDimensionsCardboardBox"
                        value={formData.dimensionsCardboardBox || ""}
                        onChange={(e) => handleInputChange("dimensionsCardboardBox", e.target.value)}
                        placeholder="e.g., 30x20x15"
                      />
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Financial Information</h3>
                    
                    <div>
                      <Label htmlFor="newItemCostPerUnitBox" className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit Box ($)</Label>
                      <Input
                        id="newItemCostPerUnitBox"
                        type="number"
                        value={formData.costPerUnitBox || 0}
                        onChange={(e) => handleInputChange("costPerUnitBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemCostPerCardboardBox" className="block text-sm font-medium text-gray-700 mb-1">Cost per Cardboard Box ($)</Label>
                      <Input
                        id="newItemCostPerCardboardBox"
                        type="number"
                        value={formData.costPerCardboardBox || 0}
                        onChange={(e) => handleInputChange("costPerCardboardBox", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
                    
                    <div>
                      <Label htmlFor="newItemRelevantLink" className="block text-sm font-medium text-gray-700 mb-1">Relevant Link</Label>
                      <Input
                        id="newItemRelevantLink"
                        type="url"
                        value={formData.relevantLink || ""}
                        onChange={(e) => handleInputChange("relevantLink", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newItemOtherNotes" className="block text-sm font-medium text-gray-700 mb-1">Other Notes</Label>
                      <Textarea
                        id="newItemOtherNotes"
                        value={formData.otherNotes || ""}
                        onChange={(e) => handleInputChange("otherNotes", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsNewItemModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem} className="bg-green-600 hover:bg-green-700">
                Create Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-gray-500">
        <span>B4P Medical Supplies Management System</span>
      </footer>
    </div>
  );
}
