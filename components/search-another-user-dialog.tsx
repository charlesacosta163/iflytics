"use client";

import { useState } from "react";
import { TbSearch } from "react-icons/tb";
import { LuUserSearch } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { searchUserAction } from "@/lib/actions";
import { SearchUserButton } from "@/components/searchuser-btn";

const SearchAnotherUserDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge className="cursor-pointer whitespace-nowrap">
          <LuUserSearch />
          Search For Another User
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="font-bold">Look up an Infinite Flight User</DialogTitle>
        </DialogHeader>

        <form
          action={searchUserAction}
          className="flex flex-col gap-3"
        >
          <div className="relative">
            <input
              type="text"
              name="name"
              className="bg-white dark:bg-gray-900 pl-8 pr-3 py-2 rounded-lg outline-none w-full text-sm placeholder:text-gray-400 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-400 transition-colors font-medium"
              placeholder="IFC Username"
              required
              autoFocus
            />
            <TbSearch className="absolute left-2.5 top-[9px] text-sm text-gray-400" />
          </div>
          <SearchUserButton
            label="Search User"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-sm py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchAnotherUserDialog;
