"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";

import { Button } from "./button";

import { Plus } from "lucide-react";
import Image from "next/image";
import SubmitButton from "../SubmitButton";
import createBankLink from "@/app/api/GoCardless/actions/createBankLink";

interface SelectItemProps {
  label: string;
  value: string;
  img?: string;
}

interface SelectDialogProps {
  items: SelectItemProps[];
  onSelect?: (value: string) => void;
}

export function SelectDialog({ items }: SelectDialogProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState("");

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Connect Bank</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          action={async (formData: FormData) => {
            await createBankLink(selectedBank, formData);
          }}
        >
          <DialogHeader>
            <DialogTitle>Select a Bank</DialogTitle>
            <DialogDescription>
              Use the select below to choose an Bank.
            </DialogDescription>
          </DialogHeader>

          <Select onValueChange={setSelectedBank}>
            <SelectTrigger className="w-full mt-4 h-12">
              <SelectValue placeholder="Select a Bank" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center">
                    {item.img && (
                      <span className="mr-2 w-7 h-7">
                        <Image
                          src={item.img}
                          height={50}
                          width={50}
                          alt={item.label}
                        />
                      </span>
                    )}
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBank && (
            <p className="text-sm text-muted-foreground mt-4">
              You selected: <strong>{selectedBank}</strong>
            </p>
          )}

          <SubmitButton
            className="flex items-center cursor-pointer space-x-2 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105cursor-pointer"
            label="Connect Bank"
            loading="Connecting Bank..."
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
