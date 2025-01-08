"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaSave } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { UpdateCustomerC } from "@/lib/actions/customer/action/customer-action";
import { useQueryClient } from "@tanstack/react-query";
import { IMaterial } from "@/lib/actions/materials/type/material-type";
import { useGetBrand } from "@/lib/actions/brand/react-query/brand-query";
import { useGetCategory } from "@/lib/actions/materials-fields/react-query/category-query";
import { UpdateMaterial } from "@/lib/actions/materials/action/material-action";

export default function UpdateMaterialP({ item }: { item: IMaterial }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectBrand] = useState({
    id: "",
    name: item.material.brand,
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const { data: caterogies, isLoading: isLoadingCategories } = useGetCategory();
  const selectedCategoryData = caterogies?.data.find(
    (category) => category.id === selectedCategory
  );
  const { data: brands, isLoading: isLoadingBrand } = useGetBrand();
  const handleBrandChange = (value: any) => {
    const selectedBrandObject = brands?.data.find((item) => item.id === value);
    setSelectBrand(selectedBrandObject || { id: "", name: "" }); // Handle potential missing store
  };
  const [material, setMaterial] = useState({
    id: item.material.id,
    name: item.material.name,
    weightValue: item.material.weightValue,
    barCode: item.material.barCode,
    description: item.material.description,
    salePrice: item.material.salePrice,
    costPrice: item.material.costPrice,
    imageFiles: item.material.imageUrl,
  });
  const handleDescriptionChange = (value: string) => {
    setMaterial((prevMaterial) => ({
      ...prevMaterial, // Keep the other properties unchanged
      description: value, // Update only the description
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaterial((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  if (!item) return <div>Đang tải....</div>;

  //   const handleUpdateClick = async () => {
  //     if (!customer.province) {
  //       toast({
  //         title: "Lỗi",
  //         description: "Vui lòng chọn tỉnh.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     if (!customer.district) {
  //       toast({
  //         title: "Lỗi",
  //         description: "Vui lòng chọn quận/huyện.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     if (!customer.ward) {
  //       toast({
  //         title: "Lỗi",
  //         description: "Vui lòng chọn phường/xã.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     const data = {
  //       id: item.id,
  //       fullName: customer.fullName,
  //       email: customer.email,
  //       phoneNumber: customer.phoneNumber,
  //       province: customer.province,
  //       district: customer.district,
  //       ward: customer.ward,
  //       address: customer.address,
  //       taxCode: customer.taxCode,
  //       note: customer.note,
  //     };

  //     try {
  //       setIsLoading(true);
  //       const result = await UpdateCustomerC(data);
  //       if (result.success) {
  //         toast({
  //           title: "Thành công",
  //           description: "Đơn vị mới đã được tạo thành công.",
  //           style: {
  //             backgroundColor: "green",
  //             color: "white",
  //           },
  //         });

  //         queryClient.invalidateQueries({
  //           queryKey: ["ALL_CUSTOMER"],
  //         });
  //       } else {
  //         toast({
  //           title: "Lỗi",
  //           description: result.error || "Có lỗi xảy ra vui lòng thử lại.",
  //           variant: "destructive",
  //         });
  //       }
  //     } catch (error) {
  //       toast({
  //         title: "Lỗi",
  //         description: "Có lỗi xảy ra khi kết nối đến server.",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  const [image64, setImage64] = useState("");

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        const base64WithoutPrefix = base64.replace(/^data:.+;base64,/, "");
        setImage64(base64WithoutPrefix);
        setMaterial((prev) => ({
          ...prev,
          imageFiles: base64,
        }));
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }
  };
  const handleUpdate = async () => {
    const data = {
      id: material.id,
      name: material.name,
      weightValue: material.weightValue,
      barCode: material.barCode,
      categoryId: selectedSubCategory,
      brandId: selectedBrand.id,
      description: material.description,
      salePrice: material.salePrice,
      costPrice: material.costPrice,
      imageFiles: [image64],
    };
    setLoading(true);

    try {
      const result = await UpdateMaterial(data);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đơn vị mới đã được tạo thành công.",
          style: {
            backgroundColor: "green",
            color: "white",
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["MATERIAL_LIST"],
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Có lỗi xảy ra khi tạo đơn vị mới.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi kết nối đến server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <div className="col-span-2 items-center">
          {" "}
          <img
            src={material.imageFiles}
            alt="Material"
            style={{
              width: "350px",
              height: "350px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("image-upload")?.click()}
          />
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>
        <div className="col-span-3 col-start-3 space-y-3">
          <div className="grid grid-cols-3 grid-rows-1 gap-4">
            <div className="font-bold">Tên Vật liệu:</div>
            <div className="col-span-2 col-start-2">
              <input
                className="border-b w-full hover:border-b-green-500 focus:outline-none focus:border-b-green-500 "
                type="text"
                name="name"
                value={material.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-1 gap-4">
            <div className="font-bold">Khối lượng:</div>
            <div className="col-span-2 col-start-2">
              <input
                className="border-b w-full hover:border-b-green-500 focus:outline-none focus:border-b-green-500 "
                type="number"
                name="weightValue"
                value={material.weightValue}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-1 gap-4">
            <div className="font-bold">Giá gốc:</div>
            <div className="col-span-2 col-start-2">
              <input
                className="border-b w-full hover:border-b-green-500 focus:outline-none focus:border-b-green-500 "
                type="number"
                name="costPrice"
                value={material.costPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-1 gap-4">
            <div className="font-bold">Giá bán:</div>
            <div className="col-span-2 col-start-2">
              <input
                className="border-b w-full hover:border-b-green-500 focus:outline-none focus:border-b-green-500 "
                type="number"
                name="salePrice"
                value={material.salePrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-1 gap-4 items-center">
            <div className="font-bold">Thương hiệu:</div>
            <div>
              <input
                className="border-b w-full hover:border-b-green-500 focus:outline-none focus:border-b-green-500 "
                type="text"
                readOnly
                value={selectedBrand.name}
              />
            </div>
            <div>
              <Select
                onValueChange={handleBrandChange}
                value={selectedBrand.id}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn Thương Hiệu" />
                </SelectTrigger>
                <SelectContent>
                  {brands?.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-1 gap-4 items-center">
            <div className="font-bold">Dạnh mục:</div>
            <div className="col-span-2 col-start-2">
              <div className="flex w-full justify-between">
                <div>
                  {/* Chọn Danh mục chính */}
                  <Select
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedSubCategory(""); // Reset danh mục phụ
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn Danh mục chính" />
                    </SelectTrigger>
                    <SelectContent>
                      {caterogies?.data.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && (
                  <div>
                    {/* Chọn SubCategory */}
                    <Select
                      onValueChange={(value) => setSelectedSubCategory(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={
                            selectedSubCategory
                              ? selectedCategoryData?.subCategories.find(
                                  (sub) => sub.id === selectedSubCategory
                                )?.name
                              : "Chọn Danh mục phụ"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategoryData?.subCategories.map(
                          (subCategory) => (
                            <SelectItem
                              key={subCategory.id}
                              value={subCategory.id}
                            >
                              {subCategory.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <ReactQuill
              value={material.description}
              onChange={handleDescriptionChange}
              theme="snow"
              placeholder="Nhập mô tả tại đây..."
              className="h-[100px]"
            />
          </div>
          <div className="flex justify-end pt-10">
            <Button
              onClick={handleUpdate}
              className="bg-blue-500 hover:bg-blue-600 font-bold text-white"
            >
              Cập nhật
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}